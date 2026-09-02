/**
 * GoogleSearchQuery
 *
 * Stores per-query GSC search performance aggregated per sync period.
 * One record per storeSlug + date (period start) + query.
 *
 * Purpose: Identify ranking opportunities, high-impression/low-CTR queries,
 *          declining queries, and high-value queries for SEO analysis.
 *
 * Data volume note: Capped at 500 top queries per sync period. This is sufficient
 * for actionable growth analysis. Storing every query would grow unbounded.
 *
 * Date field: Represents the start of the sync period (not a single day),
 * because GSC query data is aggregated across date ranges to stay within row limits.
 */
const mongoose = require("mongoose");

const googleSearchQuerySchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true, index: true },
    siteUrl: { type: String, required: true },

    date: { type: String, required: true }, // Start date of the sync period

    // ── Google-provided: Dimension ────────────────────────────────────────
    query: { type: String, required: true },

    // ── Google-provided: Metrics ──────────────────────────────────────────
    clicks: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 },
    position: { type: Number, default: 0 },

    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Unique: one record per store + period + query
googleSearchQuerySchema.index({ storeSlug: 1, date: 1, query: 1 }, { unique: true });
googleSearchQuerySchema.index({ storeSlug: 1, date: 1 });

/**
 * TTL index — MongoDB automatically deletes documents 365 days after syncedAt.
 * Rolling 1-year retention with no manual cleanup needed.
 */
googleSearchQuerySchema.index({ syncedAt: 1 }, { expireAfterSeconds: 31_536_000 });

module.exports = mongoose.model("GoogleSearchQuery", googleSearchQuerySchema);
