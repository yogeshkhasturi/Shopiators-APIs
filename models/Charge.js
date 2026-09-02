const mongoose = require("mongoose");

const chargeSchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true, index: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },

    title: { type: String, required: true },
    description: { type: String },

    type: { type: String, enum: ["manual", "add_on", "credit", "discount"], required: true },
    amount: { type: Number, required: true }, // Negative for credits/discounts

    collectionMode: { type: String, enum: ["immediate", "next_cycle", "recurring"], required: true },

    status: {
      type: String,
      enum: ["pending", "scheduled", "invoiced", "paid", "failed", "canceled", "expired"],
      default: "pending"
    },

    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Charge", chargeSchema);
