/**
 * GoogleSearchDaily
 *
 * Stores aggregate daily Search Console performance per store.
 * One record per storeSlug per date.
 *
 * Provides the overall organic search health signal.
 * Used for detecting organic traffic declines, CTR trends, and position changes.
 *
 * GSC data lag: Typically 2–3 days behind the current date.
 */
const mongoose = require("mongoose");

const googleSearchDailySchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true, index: true },

    // The verified GSC site URL (e.g., "sc-domain:example.com" or "https://example.com/")
    siteUrl: { type: String, required: true },

    date: { type: String, required: true }, // YYYY-MM-DD

    // ── Google-provided: Metrics ──────────────────────────────────────────
    clicks: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 },       // 0–1 decimal
    position: { type: Number, default: 0 },   // Average position (lower is better)

    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Unique: one record per store per day
googleSearchDailySchema.index({ storeSlug: 1, date: 1 }, { unique: true });

/**
 * TTL index — MongoDB automatically deletes documents 365 days after syncedAt.
 * Rolling 1-year retention with no manual cleanup needed.
 */
googleSearchDailySchema.index({ syncedAt: 1 }, { expireAfterSeconds: 31_536_000 });

module.exports = mongoose.model("GoogleSearchDaily", googleSearchDailySchema);
