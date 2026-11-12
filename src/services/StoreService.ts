const Store = require('../../models/store');
const Product = require('../../models/Product');
const GeneralSetting = require('../../models/GeneralSetting');
const Currency = require('../../models/Currency');

export class StoreService {
  static async getStoreMetadata(storeSlug: string) {
    const [store, productCount, generalSetting] = await Promise.all([
      Store.findOne({ storeSlug })
        .select(
          'storeSlug storeName businessName businessType industry description storeUrl status logo brandColors billingSnapshot.plan billingSnapshot.planSlug'
        )
        .lean(),
      Product.countDocuments({ storeSlug }),
      GeneralSetting.findOne({ storeSlug }).select('selectedCurrencyId').lean(),
    ]);

    if (!store) {
      return null;
    }

    let currency: { code: string; symbol?: string | null } | null = null;
    if (generalSetting?.selectedCurrencyId) {
      currency = await Currency.findOne({
        _id: generalSetting.selectedCurrencyId,
        storeSlug,
      })
        .select('code symbol')
        .lean();
    }

    if (!currency) {
      currency = await Currency.findOne({ storeSlug }).select('code symbol').lean();
    }

    return {
      store,
      currency: currency ? { code: currency.code, symbol: currency.symbol ?? null } : null,
      productCount,
    };
  }
}

