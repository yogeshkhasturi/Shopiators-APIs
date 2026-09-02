const mongoose = require("mongoose");

const AnalyticsSchema = new mongoose.Schema({
  storeSlug: {
    type: String,
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
  },
  addedToCart: {
    type: Boolean,
    default: false,
  },
  reachedCheckout: {
    type: Boolean,
    default: false,
  },
  converted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Indexes for fast queries
AnalyticsSchema.index({ storeSlug: 1, createdAt: -1 });
AnalyticsSchema.index({ sessionId: 1 }, { unique: true });

module.exports = mongoose.model("Analytics", AnalyticsSchema);
