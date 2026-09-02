/**
 * GrowthOpportunity
 *
 * Stores detected growth opportunities for a store.
 * Populated by the deterministic Growth Opportunity Engine.
 *
 * Design principles:
 *   - source: which data source detected the opportunity (GA4, GSC, or COMBINED)
 *   - category: the business domain (SEO, TRAFFIC, CONVERSION, REVENUE, etc.)
 *   - type: specific machine-readable type (e.g., "HIGH_IMPRESSIONS_LOW_CTR")
 *   - priority: P0–P3 using the Shopiators growth queue model
 *   - evidence: structured data showing WHY the opportunity was detected (for AI enrichment later)
 *   - detectionMetrics / postActionMetrics: supports the measurement loop
 *     (detect → action → measure impact)
 *
 * Opportunity types (V1):
 *   ORGANIC_TRAFFIC_DECLINE
 *   HIGH_IMPRESSIONS_LOW_CTR
 *   RANKING_OPPORTUNITY
 *   HIGH_TRAFFIC_LOW_CONVERSION
 *   TRAFFIC_STABLE_CONVERSION_DOWN
 *   REVENUE_DECLINE
 */
const mongoose = require("mongoose");

const OPPORTUNITY_SOURCE = { GA4: "GA4", GSC: "GSC", COMBINED: "COMBINED" };
const OPPORTUNITY_CATEGORY = {
  SEO: "SEO",
  TRAFFIC: "TRAFFIC",
  CONVERSION: "CONVERSION",
  REVENUE: "REVENUE",
  ACQUISITION: "ACQUISITION",
  CONTENT: "CONTENT",
  TRACKING: "TRACKING",
};
const OPPORTUNITY_PRIORITY = { P0: "P0", P1: "P1", P2: "P2", P3: "P3" };
const OPPORTUNITY_STATUS = {
  AI_DETECTED: "AI_DETECTED",
  NEEDS_REVIEW: "NEEDS_REVIEW",
  HUMAN_REVIEWED: "HUMAN_REVIEWED",
  RECOMMENDATION_SENT: "RECOMMENDATION_SENT",
  WAITING_FOR_MERCHANT: "WAITING_FOR_MERCHANT",
  APPROVED_FOR_EXECUTION: "APPROVED_FOR_EXECUTION",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  MEASURING_IMPACT: "MEASURING_IMPACT",
  NO_ACTION_REQUIRED: "NO_ACTION_REQUIRED",
};

const growthOpportunitySchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true, index: true },

    // ── Classification ────────────────────────────────────────────────────
    source: {
      type: String,
      enum: Object.values(OPPORTUNITY_SOURCE),
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(OPPORTUNITY_CATEGORY),
      required: true,
    },
    // Machine-readable type for deduplication and grouping
    type: { type: String, required: true },

    // ── Priority ──────────────────────────────────────────────────────────
    priority: {
      type: String,
      enum: Object.values(OPPORTUNITY_PRIORITY),
      required: true,
    },

    // ── Human-readable content ────────────────────────────────────────────
    title: { type: String, required: true },
    description: { type: String, required: true },
    recommendation: { type: String },

    // ── Evidence ──────────────────────────────────────────────────────────
    // Structured data explaining why this opportunity was detected.
    // Used for display and future AI enrichment.
    // Example: { currentClicks: 120, previousClicks: 174, change: -31.0, affectedPages: [...] }
    evidence: { type: mongoose.Schema.Types.Mixed, default: {} },

    // ── Workflow Status ───────────────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(OPPORTUNITY_STATUS),
      default: OPPORTUNITY_STATUS.AI_DETECTED,
    },

    // ── Measurement Loop Support ──────────────────────────────────────────
    // Snapshot of metrics at detection time (for measuring improvement later)
    detectionMetrics: { type: mongoose.Schema.Types.Mixed, default: {} },
    // Date when the recommended action was taken
    actionDate: { type: Date },
    // Snapshot of metrics after action (to measure impact)
    postActionMetrics: { type: mongoose.Schema.Types.Mixed, default: {} },

    detectedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for dashboard and Super Admin queries
growthOpportunitySchema.index({ storeSlug: 1, status: 1 });
growthOpportunitySchema.index({ storeSlug: 1, priority: 1 });
growthOpportunitySchema.index({ storeSlug: 1, type: 1, detectedAt: -1 });

module.exports = mongoose.model("GrowthOpportunity", growthOpportunitySchema);
module.exports.OPPORTUNITY_SOURCE = OPPORTUNITY_SOURCE;
module.exports.OPPORTUNITY_CATEGORY = OPPORTUNITY_CATEGORY;
module.exports.OPPORTUNITY_PRIORITY = OPPORTUNITY_PRIORITY;
module.exports.OPPORTUNITY_STATUS = OPPORTUNITY_STATUS;
