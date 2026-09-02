const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const migrationBatchSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: true,
      unique: true,
      default: () => `batch-${uuidv4()}`
    },
    migrationId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "MigrationJob", 
      required: true,
      index: true
    },
    storeSlug: { 
      type: String, 
      required: true,
      index: true
    },
    entityType: { 
      type: String, 
      required: true,
      enum: ["products", "variants", "collections", "customers", "orders", "media"]
    },
    status: {
      type: String,
      enum: ["QUEUED", "PROCESSING", "COMPLETED", "FAILED"],
      default: "QUEUED",
      index: true
    },
    items: {
      type: Array,
      required: true
    },
    metrics: {
      accepted: { type: Number, default: 0 },
      processed: { type: Number, default: 0 },
      failed: { type: Number, default: 0 }
    },
    errors: {
      type: Array,
      default: []
    },
    startedAt: { type: Date },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

// Indexes for rapid progress aggregation
migrationBatchSchema.index({ migrationId: 1, status: 1 });

module.exports = mongoose.model("MigrationBatch", migrationBatchSchema);
