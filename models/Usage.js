const mongoose = require("mongoose");

const usageSchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true, unique: true },
    cycleEnd: { type: Date, required: true },
    metrics: {
      storage: {
        used: { type: Number, default: 0 },
        limit: { type: Number, default: 50 }, // -1 for unlimited
      },
      orders: {
        used: { type: Number, default: 0 },
        limit: { type: Number, default: 5000 },
      },
      staff: {
        used: { type: Number, default: 1 },
        limit: { type: Number, default: 5 },
      },
      aiCredits: {
        used: { type: Number, default: 0 },
        limit: { type: Number, default: 500 },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Usage", usageSchema);
