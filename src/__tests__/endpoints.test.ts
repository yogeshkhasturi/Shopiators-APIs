import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../app';
import { StoreService } from '../services/StoreService';
import { InventoryService } from '../services/InventoryService';
import { AnalyticsService, calculateSalesMetrics } from '../services/AnalyticsService';

function signTenantToken(storeSlug: string, scopes: string[]) {
  process.env.PUBLIC_API_JWT_SECRET = 'test-jwt-secret';
  return jwt.sign(
    {
      sub: 'user-1',
      storeSlug,
      type: 'public_api_access',
      scopes,
    },
    process.env.PUBLIC_API_JWT_SECRET
  );
}

describe('TSK-06: GET /api/v1/store', () => {
  it('requires authentication and store:read scope', async () => {
    const noAuth = await request(app).get('/api/v1/store');
    expect(noAuth.status).toBe(401);

    const wrongScope = await request(app)
      .get('/api/v1/store')
      .set('Authorization', `Bearer ${signTenantToken('tenant-a', ['products:read'])}`);
    expect(wrongScope.status).toBe(403);
  });

  it('returns only non-sensitive metadata scoped to authenticated tenant', async () => {
    const spy = jest.spyOn(StoreService, 'getStoreMetadata').mockResolvedValue({
      store: {
        storeSlug: 'tenant-a',
        storeName: 'Tenant A Shop',
        businessName: 'Tenant A LLC',
        businessType: 'Retail',
        industry: 'Fashion',
        description: 'Apparel store',
        storeUrl: 'https://tenant-a.shopiators.com',
        status: 'active',
        logo: 'https://cdn.example.com/logo.png',
        brandColors: { primary: '#000', secondary: '#fff' },
        billingSnapshot: { plan: { slug: 'pro', name: 'Pro Plan' } },
        config: { secretWebhookKey: 'should-never-leak' },
        tenantId: 'internal-tid',
      },
      currency: { code: 'INR', symbol: '₹' },
      productCount: 42,
    });

    const res = await request(app)
      .get('/api/v1/store?storeSlug=tenant-b')
      .set('Authorization', `Bearer ${signTenantToken('tenant-a', ['store:read'])}`);

    expect(res.status).toBe(200);
    expect(spy).toHaveBeenCalledWith('tenant-a');
    expect(res.body.data.storeSlug).toBe('tenant-a');
    expect(res.body.data.currency).toEqual({ code: 'INR', symbol: '₹' });
    expect(res.body.data.productCount).toBe(42);
    expect(res.body.data.config).toBeUndefined();
    expect(res.body.data.tenantId).toBeUndefined();
  });
});

describe('TSK-08: GET /api/v1/inventory/alerts', () => {
  it('requires authentication and inventory:read scope', async () => {
    const noAuth = await request(app).get('/api/v1/inventory/alerts');
    expect(noAuth.status).toBe(401);

    const wrongScope = await request(app)
      .get('/api/v1/inventory/alerts')
      .set('Authorization', `Bearer ${signTenantToken('tenant-a', ['store:read'])}`);
    expect(wrongScope.status).toBe(403);
  });

  it('validates threshold query param and scopes alerts to authenticated tenant', async () => {
    const badRes = await request(app)
      .get('/api/v1/inventory/alerts?threshold=-5')
      .set('Authorization', `Bearer ${signTenantToken('tenant-a', ['inventory:read'])}`);
    expect(badRes.status).toBe(400);

    const spy = jest.spyOn(InventoryService, 'getAlerts').mockResolvedValue({
      alerts: [
        {
          type: 'variant',
          productId: 'p1',
          variantId: 'v1',
          title: 'T-Shirt',
          sku: 'TS-M',
          attributes: { Size: 'M' },
          stock: 2,
          threshold: 5,
          severity: 'low_stock',
        },
      ],
      summary: { threshold: 5, includeOutOfStock: true, outOfStockCount: 0, lowStockCount: 1 },
      pagination: { total: 1, page: 1, limit: 25, totalPages: 1 },
    });

    const okRes = await request(app)
      .get('/api/v1/inventory/alerts?threshold=5')
      .set('Authorization', `Bearer ${signTenantToken('tenant-a', ['inventory:read'])}`);

    expect(okRes.status).toBe(200);
    expect(spy).toHaveBeenCalledWith('tenant-a', expect.objectContaining({ threshold: 5 }));
    expect(okRes.body.data).toHaveLength(1);
  });
});

describe('TSK-07: GET /api/v1/analytics/sales & Metrics Calculation', () => {
  it('requires authentication, orders:read scope, and enforces max 90-day date range', async () => {
    const noAuth = await request(app).get('/api/v1/analytics/sales');
    expect(noAuth.status).toBe(401);

    const wrongScope = await request(app)
      .get('/api/v1/analytics/sales')
      .set('Authorization', `Bearer ${signTenantToken('tenant-a', ['store:read'])}`);
    expect(wrongScope.status).toBe(403);

    const tooLong = await request(app)
      .get('/api/v1/analytics/sales?startDate=2026-01-01T00:00:00Z&endDate=2026-06-01T00:00:00Z')
      .set('Authorization', `Bearer ${signTenantToken('tenant-a', ['orders:read'])}`);
    expect(tooLong.status).toBe(400);
    expect(tooLong.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('scopes analytics query to authenticated tenant', async () => {
    const spy = jest.spyOn(AnalyticsService, 'getSalesAnalytics').mockResolvedValue({
      period: { startDate: '2026-10-01T00:00:00.000Z', endDate: '2026-10-15T00:00:00.000Z' },
      metrics: {
        grossSales: 500,
        netRevenue: 450,
        totalRefunds: 50,
        aov: 250,
        totalOrders: 3,
        paidOrders: 2,
        unpaidOrders: 0,
        cancelledOrders: 1,
        refundedOrders: 1,
      },
      breakdownByOrderStatus: { delivered: 2, cancelled: 1 },
      breakdownByPaymentStatus: { paid: 1, partially_refunded: 1, unpaid: 1 },
    });

    const res = await request(app)
      .get('/api/v1/analytics/sales?startDate=2026-10-01T00:00:00Z&endDate=2026-10-15T00:00:00Z')
      .set('Authorization', `Bearer ${signTenantToken('tenant-a', ['orders:read'])}`);

    expect(res.status).toBe(200);
    expect(spy).toHaveBeenCalledWith('tenant-a', expect.any(Object));
    expect(res.body.data.metrics.netRevenue).toBe(450);
  });

  it('accurately computes grossSales, netRevenue, AOV, and counts across paid, unpaid, cancelled, refunded, partially_refunded orders', () => {
    const result = calculateSalesMetrics([
      { orderStatus: 'delivered', paymentStatus: 'paid', totalAmount: 200 },
      { orderStatus: 'pending', paymentStatus: 'unpaid', totalAmount: 100 },
      { orderStatus: 'cancelled', paymentStatus: 'paid', totalAmount: 150 },
      { orderStatus: 'refunded', paymentStatus: 'refunded', totalAmount: 100 },
      {
        orderStatus: 'delivered',
        paymentStatus: 'partially_refunded',
        totalAmount: 300,
        historicalRefundAmount: 75,
      },
    ]);

    expect(result.metrics.totalOrders).toBe(5);
    expect(result.metrics.paidOrders).toBe(3); // delivered+paid, refunded, delivered+partially_refunded
    expect(result.metrics.unpaidOrders).toBe(1);
    expect(result.metrics.cancelledOrders).toBe(1);
    expect(result.metrics.refundedOrders).toBe(2);
    expect(result.metrics.grossSales).toBe(600); // 200 + 100 + 300
    expect(result.metrics.totalRefunds).toBe(175); // 100 + 75
    expect(result.metrics.netRevenue).toBe(425); // 600 - 175
    expect(result.metrics.aov).toBe(200); // 600 / 3
  });
});

