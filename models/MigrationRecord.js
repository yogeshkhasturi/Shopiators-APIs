const mongoose = require("mongoose");

const migrationRecordSchema = new mongoose.Schema(
  {
    migrationId: { type: mongoose.Schema.Types.ObjectId, ref: "MigrationJob", required: true },
    storeSlug: { type: String, required: true },
    entityType: { type: String, required: true },
    sourceId: { type: String, required: true },
    status: {
      type: String,
      enum: ["FAILED", "RETRIED_SUCCESS"],
      required: true,
    },
    attempts: { type: Number, default: 0 },
    shopiatorsEntityId: { type: mongoose.Schema.Types.ObjectId },
    errorCode: { type: String },
    errorMessage: { type: String },
    retryable: { type: Boolean, default: false },
    batchId: { type: String },
    lastAttemptAt: { type: Date },
  },
  { timestamps: true }
);

migrationRecordSchema.index({ migrationId: 1, status: 1 });

module.exports = mongoose.model("MigrationRecord", migrationRecordSchema);
