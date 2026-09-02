const mongoose = require("mongoose");

const migrationJobSchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true },
    sourcePlatform: { type: String, required: true }, // e.g., 'shopify', 'woocommerce', 'generic_csv'
    destinationPlatform: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "DRAFT",
        "FILES_UPLOADED",
        "MAPPING_IN_PROGRESS",
        "VALIDATING",
        "READY",
        "RUNNING",
        "PAUSED",
        "CANCELLING",
        "CANCELLED",
        "COMPLETED",
        "COMPLETED_WITH_ERRORS",
        "FAILED",
      ],
      default: "DRAFT",
    },
    migrationType: {
      type: String,
      enum: ["IMPORT", "EXPORT", "SYNC"],
      required: true,
    },
    configuration: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // New fields for generalized CSV migration
    files: [
      {
        entityType: { type: String }, // e.g., 'products', 'customers'
        filename: { type: String },
        originalName: { type: String },
        path: { type: String },
        size: { type: Number },
        rowCount: { type: Number, default: 0 },
        detectedFormat: { type: String }, // e.g., 'shopify_products_csv'
        headers: [{ type: String }],
        uploadedAt: { type: Date, default: Date.now },
      }
    ],
    mappings: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        products: {},
        variants: {},
        collections: {},
        customers: {},
        orders: {},
        orderItems: {}
      }
    },
    relationships: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    validationSummary: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    progress: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    errors: {
      type: Array,
      default: []
    },
    statistics: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    progressCursors: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

// Prevent duplicate active migrations for the same store, platform, and type.
migrationJobSchema.index(
  { storeSlug: 1, sourcePlatform: 1, migrationType: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: ["VALIDATING", "READY", "RUNNING", "PAUSED", "CANCELLING", "FILES_UPLOADED", "MAPPING_IN_PROGRESS"],
      },
    },
  }
);

module.exports = mongoose.model("MigrationJob", migrationJobSchema);
