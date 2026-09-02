/**
 * GoogleAnalyticsDaily
 *
 * Stores normalised daily GA4 traffic + ecommerce metrics per store.
 * One record per storeSlug per date.
 *
 * All numeric fields are Google-provided values unless noted.
 * Shopiators-calculated metrics (e.g. conversionRate) are NOT stored here;
 * they are computed on-the-fly by the aggregation service.
 */
const mongoose = require("mongoose");

const googleAnalyticsDailySchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true, index: true },

    // Date in YYYY-MM-DD format (stored as string for simplicity and to match GSC format)
    date: { type: String, required: true },

    // ── Google-provided: Traffic ──────────────────────────────────────────
    users: { type: Number, default: 0 },
    newUsers: { type: Number, default: 0 },
    sessions: { type: Number, default: 0 },
    engagedSessions: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },         // 0–1 (Google decimal)
    averageEngagementTime: { type: Number, default: 0 },  // seconds
    eventCount: { type: Number, default: 0 },

    // ── Google-provided: Ecommerce ────────────────────────────────────────
    // These are 0 if ecommerce tracking is not configured in GA4
    itemViews: { type: Number, default: 0 },
    addToCart: { type: Number, default: 0 },
    checkoutStarts: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    purchaseRevenue: { type: Number, default: 0 },

    // Sync metadata
    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Unique: one record per store per day
googleAnalyticsDailySchema.index({ storeSlug: 1, date: 1 }, { unique: true });

/**
 * TTL index — MongoDB automatically deletes documents 365 days after syncedAt.
 * Rolling retention: data from exactly one year ago is purged daily by the MongoDB TTL monitor.
 * No application-level cron is required for deletion.
 */
googleAnalyticsDailySchema.index({ syncedAt: 1 }, { expireAfterSeconds: 31_536_000 });

module.exports = mongoose.model("GoogleAnalyticsDaily", googleAnalyticsDailySchema);
