const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true, index: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
    number: { type: String, required: true },

    // Financials
    subtotal: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, required: true, default: 0 },
    taxAmount: { type: Number, required: true, default: 0 },
    grandTotal: { type: Number, required: true, default: 0 },

    // Kept for backward compatibility, ideally equals grandTotal
    amount: { type: Number, required: true },

    status: { type: String, enum: ["draft", "open", "paid", "overdue", "void", "uncollectible"], default: "draft" },
    billingReason: { type: String, enum: ["subscription_create", "subscription_cycle", "manual"], default: "manual" },

    provider: { type: String, enum: ["stripe", "razorpay"], required: true },
    providerInvoiceId: { type: String, index: true },
    hostedUrl: { type: String },

    date: { type: Date, default: Date.now },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
