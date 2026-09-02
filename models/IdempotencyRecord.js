const mongoose = require("mongoose");

const idempotencyRecordSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // providerId:storeSlug:endpoint:idempotencyKey
  providerId: { type: String, required: true },
  storeSlug: { type: String, required: true },
  endpoint: { type: String, required: true },
  idempotencyKey: { type: String, required: true },
  requestHash: { type: String, required: true },
  status: { type: String, enum: ["IN_PROGRESS", "COMPLETED", "FAILED"], required: true },
  responseStatus: { type: Number },
  responseBody: { type: mongoose.Schema.Types.Mixed },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

// TTL Index for automatic cleanup (e.g. 24 hours)
idempotencyRecordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("IdempotencyRecord", idempotencyRecordSchema);
