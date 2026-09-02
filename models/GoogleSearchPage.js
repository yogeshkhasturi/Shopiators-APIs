/**
 * GoogleSearchPage
 *
 * Stores per-page GSC search performance aggregated per sync period.
 * One record per storeSlug + date (period start) + page URL.
 *
 * Purpose: Identify pages with SEO visibility but poor click-through,
 *          pages gaining/losing organic traffic, and opportunities for
 *          cross-analysis with GA4 page conversion data.
 */
const mongoose = require("mongoose");

const googleSearchPageSchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true, index: true },
    siteUrl: { type: String, required: true },

    date: { type: String, required: true }, // Start date of the sync period

    // ── Google-provided: Dimension ────────────────────────────────────────
    page: { type: String, required: true }, // Full URL of the page

    // ── Google-provided: Metrics ──────────────────────────────────────────
    clicks: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 },
    position: { type: Number, default: 0 },

    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Unique: one record per store + period + page URL
googleSearchPageSchema.index({ storeSlug: 1, date: 1, page: 1 }, { unique: true });
googleSearchPageSchema.index({ storeSlug: 1, date: 1 });

/**
 * TTL index — MongoDB automatically deletes documents 365 days after syncedAt.
 * Rolling 1-year retention with no manual cleanup needed.
 */
googleSearchPageSchema.index({ syncedAt: 1 }, { expireAfterSeconds: 31_536_000 });

module.exports = mongoose.model("GoogleSearchPage", googleSearchPageSchema);
