const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true, index: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
    status: { type: String, enum: ["pending", "active", "past_due", "canceled", "unpaid", "trialing", "expired"], default: "pending" },
    billingCycle: { type: String, enum: ["monthly", "yearly"], default: "monthly" },
    provider: { type: String, enum: ["stripe", "razorpay"], required: true },

    // Provider specific fields
    providerCustomerId: { type: String },
    providerTokenId: { type: String }, // Stores the Razorpay Emandate token ID
    providerSubscriptionId: { type: String, index: true }, // For Stripe/Paypal Native
    
    // Lifecycle dates
    renewalDate: { type: Date },
    trialEnd: { type: Date },
    canceledAt: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },

    // Extensibility
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
