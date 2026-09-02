/**
 * GoogleAnalyticsPage
 *
 * Stores GA4 page-level performance per store per day.
 * One record per storeSlug + date + pagePath.
 *
 * Purpose: Identify high-traffic pages with low conversion, declining pages,
 *          and high-value landing pages. Combined with GSC page data for
 *          cross-analysis.
 *
 * Data volume note: Limited to top 200 pages per day during sync to control
 * collection size. This captures the pages that matter for growth analysis.
 */
const mongoose = require("mongoose");

const googleAnalyticsPageSchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true, index: true },

    date: { type: String, required: true },

    // ── Google-provided: Dimensions ───────────────────────────────────────
    pagePath: { type: String, required: true },

    // ── Google-provided: Metrics ──────────────────────────────────────────
    users: { type: Number, default: 0 },
    sessions: { type: Number, default: 0 },
    screenPageViews: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 }, // 0–1
    purchases: { type: Number, default: 0 },
    purchaseRevenue: { type: Number, default: 0 },

    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Unique: one record per store + date + page path
googleAnalyticsPageSchema.index({ storeSlug: 1, date: 1, pagePath: 1 }, { unique: true });
googleAnalyticsPageSchema.index({ storeSlug: 1, date: 1 });

/**
 * TTL index — MongoDB automatically deletes documents 365 days after syncedAt.
 * Rolling 1-year retention with no manual cleanup needed.
 */
googleAnalyticsPageSchema.index({ syncedAt: 1 }, { expireAfterSeconds: 31_536_000 });

module.exports = mongoose.model("GoogleAnalyticsPage", googleAnalyticsPageSchema);
