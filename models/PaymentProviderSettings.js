const mongoose = require('mongoose');

const paymentProviderSettingsSchema = new mongoose.Schema(
  {
    providerName: { type: String, required: true, enum: ['stripe', 'razorpay'], unique: true },
    isEnabled: { type: Boolean, default: false },
    isDefault: { type: Boolean, default: false },
    isTestMode: { type: Boolean, default: true },
    
    // Stripe specific keys
    publishableKey: { type: String },
    secretKey: { type: String },
    webhookSecret: { type: String },

    // Razorpay specific keys
    keyId: { type: String },
    keySecret: { type: String },
    webhookSecretRazorpay: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentProviderSettings', paymentProviderSettingsSchema);
