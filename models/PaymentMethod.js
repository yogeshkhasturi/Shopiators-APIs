const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true, index: true },
    brand: { type: String, required: true }, // e.g., 'visa', 'mastercard'
    last4: { type: String, required: true },
    expMonth: { type: Number, required: true },
    expYear: { type: Number, required: true },
    provider: { type: String, enum: ["stripe", "razorpay"], required: true },
    providerPaymentMethodId: { type: String, required: true, index: true },
    status: { type: String, enum: ["active", "expired", "failed", "canceled"], default: "active" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);
