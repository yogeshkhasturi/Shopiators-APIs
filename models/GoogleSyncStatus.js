/**
 * GoogleSyncStatus
 *
 * Tracks the sync state for each store's GA4 and GSC integrations.
 * One document per storeSlug.
 *
 * Provides the data needed for:
 *   - Merchant dashboard sync status display
 *   - Super Admin monitoring overview
 *   - Incremental sync (determining which dates to fetch next)
 *   - Error surfacing and retry decisions
 */
const mongoose = require("mongoose");

const SYNC_STATUS = {
  CONNECTED: "CONNECTED",
  SYNCING: "SYNCING",
  SYNCED: "SYNCED",
  FAILED: "FAILED",
  AUTH_REQUIRED: "AUTH_REQUIRED",
  DISCONNECTED: "DISCONNECTED",
};

const syncStateSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(SYNC_STATUS),
      default: SYNC_STATUS.CONNECTED,
    },
    lastSuccessfulSync: { type: Date },
    lastAttemptedSync: { type: Date },
    // The earliest date we have data for (set after backfill)
    earliestDataDate: { type: String },
    // The latest date we have data for
    latestDataDate: { type: String },
    // Human-readable error message for display (never contains tokens)
    errorMessage: { type: String },
    // Number of consecutive failures (used for retry logic)
    failureCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const googleSyncStatusSchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true, unique: true, index: true },

    ga4: { type: syncStateSchema, default: () => ({}) },
    gsc: { type: syncStateSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GoogleSyncStatus", googleSyncStatusSchema);
module.exports.SYNC_STATUS = SYNC_STATUS;
