import { InventoryAlertsQuery } from '../validators/InventoryValidator';

const Product = require('../../models/Product');
const Variant = require('../../models/Variant');

export interface InventoryAlertItem {
  type: 'product' | 'variant';
  productId: string;
  variantId: string | null;
  title: string;
  sku: string | null;
  attributes: Record<string, any> | null;
  stock: number;
  threshold: number;
  severity: 'out_of_stock' | 'low_stock';
}

export class InventoryService {
  static async getAlerts(storeSlug: string, query: InventoryAlertsQuery) {
    const { threshold, includeOutOfStock, includeDisabled, page, limit } = query;

    const minStock = includeOutOfStock ? undefined : 1;
    const stockCondition =
      minStock !== undefined
        ? { $gte: minStock, $lte: threshold }
        : { $lte: threshold };

    const productStatusFilter = includeDisabled ? {} : { status: 'active' };

    const [lowProducts, activeProducts, lowVariants] = await Promise.all([
      Product.find({
        storeSlug,
        ...productStatusFilter,
        $or: [{ variants: { $exists: false } }, { variants: { $size: 0 } }],
        totalStock: { $ne: null, ...stockCondition },
      })
        .select('_id title totalStock status')
        .lean(),
      Product.find({
        storeSlug,
        ...productStatusFilter,
      })
        .select('_id title')
        .lean(),
      Variant.find({
        storeSlug,
        stock: { $ne: null, ...stockCondition },
      })
        .select('_id productId attributes stock sku')
        .lean(),
    ]);

    const productTitleMap = new Map<string, string>();
    for (const p of activeProducts) {
      productTitleMap.set(String(p._id), p.title);
    }

    const alerts: InventoryAlertItem[] = [];

    for (const p of lowProducts) {
      const stock = Number(p.totalStock ?? 0);
      alerts.push({
        type: 'product',
        productId: String(p._id),
        variantId: null,
        title: p.title,
        sku: null,
        attributes: null,
        stock,
        threshold,
        severity: stock <= 0 ? 'out_of_stock' : 'low_stock',
      });
    }

    for (const v of lowVariants) {
      const pid = String(v.productId);
      const productTitle = productTitleMap.get(pid);
      if (!productTitle) {
        // Variant belongs to a disabled/missing product when includeDisabled=false
        continue;
      }
      const stock = Number(v.stock ?? 0);
      alerts.push({
        type: 'variant',
        productId: pid,
        variantId: String(v._id),
        title: productTitle,
        sku: v.sku || null,
        attributes: v.attributes || {},
        stock,
        threshold,
        severity: stock <= 0 ? 'out_of_stock' : 'low_stock',
      });
    }

    alerts.sort((a, b) => a.stock - b.stock);

    const total = alerts.length;
    const skip = (page - 1) * limit;
    const pagedAlerts = alerts.slice(skip, skip + limit);

    return {
      alerts: pagedAlerts,
      summary: {
        threshold,
        includeOutOfStock,
        outOfStockCount: alerts.filter((a) => a.severity === 'out_of_stock').length,
        lowStockCount: alerts.filter((a) => a.severity === 'low_stock').length,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

