import { SalesAnalyticsQuery } from '../validators/AnalyticsValidator';

const Order = require('../../models/Order');

export interface SalesAnalyticsResult {
  period: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    grossSales: number;
    netRevenue: number;
    totalRefunds: number;
    aov: number;
    totalOrders: number;
    paidOrders: number;
    unpaidOrders: number;
    cancelledOrders: number;
    refundedOrders: number;
  };
  breakdownByOrderStatus: Record<string, number>;
  breakdownByPaymentStatus: Record<string, number>;
}

/**
 * Pure helper to compute sales metrics from a list of tenant-scoped orders.
 * Exposed for deterministic unit testing against controlled order fixtures.
 */
export function calculateSalesMetrics(
  orders: Array<{
    orderStatus?: string;
    paymentStatus?: string;
    totalAmount?: number;
    historicalRefundAmount?: number;
    refund?: { status?: string };
  }>
) {
  let grossSales = 0;
  let totalRefunds = 0;
  let totalOrders = 0;
  let paidOrders = 0;
  let unpaidOrders = 0;
  let cancelledOrders = 0;
  let refundedOrders = 0;

  const breakdownByOrderStatus: Record<string, number> = {};
  const breakdownByPaymentStatus: Record<string, number> = {};

  for (const order of orders) {
    totalOrders += 1;
    const orderStatus = (order.orderStatus || 'pending').toLowerCase();
    const paymentStatus = (order.paymentStatus || 'pending').toLowerCase();
    const totalAmount = Number(order.totalAmount || 0);
    const historicalRefund = Number(order.historicalRefundAmount || 0);
    const refundApproved = (order.refund?.status || '').toLowerCase() === 'approved';

    breakdownByOrderStatus[orderStatus] = (breakdownByOrderStatus[orderStatus] || 0) + 1;
    breakdownByPaymentStatus[paymentStatus] = (breakdownByPaymentStatus[paymentStatus] || 0) + 1;

    const isCancelled = orderStatus === 'cancelled' || orderStatus === 'canceled';
    if (isCancelled) {
      cancelledOrders += 1;
      continue;
    }

    const isFailedOrUnpaid = paymentStatus === 'failed' || paymentStatus === 'unpaid';
    if (isFailedOrUnpaid) {
      unpaidOrders += 1;
      continue;
    }

    const isPaid =
      paymentStatus === 'paid' ||
      paymentStatus === 'completed' ||
      paymentStatus === 'captured' ||
      paymentStatus === 'partially_refunded' ||
      paymentStatus === 'refunded' ||
      orderStatus === 'confirmed' ||
      orderStatus === 'processing' ||
      orderStatus === 'shipped' ||
      orderStatus === 'delivered' ||
      orderStatus === 'completed';

    if (!isPaid) {
      unpaidOrders += 1;
      continue;
    }

    paidOrders += 1;
    grossSales += totalAmount;

    const isRefunded =
      orderStatus === 'refunded' ||
      paymentStatus === 'refunded' ||
      paymentStatus === 'partially_refunded' ||
      refundApproved ||
      historicalRefund > 0;

    if (isRefunded) {
      refundedOrders += 1;
      const refundAmount =
        historicalRefund > 0
          ? historicalRefund
          : orderStatus === 'refunded' || paymentStatus === 'refunded'
            ? totalAmount
            : 0;
      totalRefunds += refundAmount;
    }
  }

  const netRevenue = Number((grossSales - totalRefunds).toFixed(2));
  const roundedGross = Number(grossSales.toFixed(2));
  const roundedRefunds = Number(totalRefunds.toFixed(2));
  const aov = paidOrders > 0 ? Number((roundedGross / paidOrders).toFixed(2)) : 0;

  return {
    metrics: {
      grossSales: roundedGross,
      netRevenue,
      totalRefunds: roundedRefunds,
      aov,
      totalOrders,
      paidOrders,
      unpaidOrders,
      cancelledOrders,
      refundedOrders,
    },
    breakdownByOrderStatus,
    breakdownByPaymentStatus,
  };
}

export class AnalyticsService {
  static async getSalesAnalytics(
    storeSlug: string,
    query: SalesAnalyticsQuery
  ): Promise<SalesAnalyticsResult> {
    const { startDate, endDate } = query;

    const orders = await Order.aggregate([
      {
        $match: {
          storeSlug,
          $or: [
            { orderDate: { $gte: startDate, $lte: endDate } },
            { orderDate: { $exists: false }, createdAt: { $gte: startDate, $lte: endDate } },
            { orderDate: null, createdAt: { $gte: startDate, $lte: endDate } },
          ],
        },
      },
      {
        $project: {
          orderStatus: 1,
          paymentStatus: 1,
          totalAmount: 1,
          historicalRefundAmount: 1,
          'refund.status': 1,
        },
      },
    ]);

    const computed = calculateSalesMetrics(orders);

    return {
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      ...computed,
    };
  }
}

