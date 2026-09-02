const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true, index: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", index: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
    
    description: { type: String, required: true },
    reference: { type: String }, // e.g. receipt or local reference
    
    provider: { type: String, enum: ["stripe", "razorpay", "manual"], required: true },
    providerTransactionId: { type: String, index: true }, // e.g. charge ID or payment intent ID
    
    amount: { type: Number, required: true },
    status: { type: String, enum: ["success", "failed", "pending", "refunded"], required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
