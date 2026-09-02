/**
 * GoogleAnalyticsAcquisition
 *
 * Stores GA4 acquisition (traffic source) breakdown per store per day.
 * One record per storeSlug + date + source + medium + campaign.
 *
 * Purpose: Identify which channels drive traffic, engaged sessions, and revenue.
 */
const mongoose = require("mongoose");

const googleAnalyticsAcquisitionSchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true, index: true },

    date: { type: String, required: true },

    // ── Google-provided: Dimensions ───────────────────────────────────────
    source: { type: String, default: "(direct)" },
    medium: { type: String, default: "(none)" },
    campaign: { type: String, default: "(not set)" },

    // ── Google-provided: Metrics ──────────────────────────────────────────
    sessions: { type: Number, default: 0 },
    users: { type: Number, default: 0 },
    engagedSessions: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },

    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Unique: one record per store + date + channel combination
googleAnalyticsAcquisitionSchema.index(
  { storeSlug: 1, date: 1, source: 1, medium: 1, campaign: 1 },
  { unique: true }
);
googleAnalyticsAcquisitionSchema.index({ storeSlug: 1, date: 1 });

/**
 * TTL index — MongoDB automatically deletes documents 365 days after syncedAt.
 * Rolling 1-year retention with no manual cleanup needed.
 */
googleAnalyticsAcquisitionSchema.index({ syncedAt: 1 }, { expireAfterSeconds: 31_536_000 });

module.exports = mongoose.model("GoogleAnalyticsAcquisition", googleAnalyticsAcquisitionSchema);
