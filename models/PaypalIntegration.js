const mongoose = require("mongoose");

const paypalIntegrationSchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true, unique: false },
    trackingId: { type: String },

    // PayPal merchant info
    merchantIdInPayPal: String,
    productIntentId: String,

    isEmailConfirmed: Boolean,
    primary_email_confirmed: Boolean,
    accountStatus: String,
    onboardingStatus: String,
    connected: { type: Boolean, default: false },
    permissionsGranted: Boolean,
    consentStatus: Boolean,
    paymentsReceivable: Boolean,
    riskStatus: String,

    //  NEW FIELDS
    accessToken: String,
    onboardingUrl: String,
    showOnCheckout: { type: Boolean, default: false },
    lastSyncedAt: Date,
    connected: { type: Boolean, default: false },
    email: String,
    webhookId: String,
    country: String,
    isIndianMerchant: Boolean,
    debugId: String,

    // optional: full raw response
    rawData: Object,
    minOrderValue: { type: Number, default: 0 },
    maxOrderValue: { type: Number, default: 0 },
    includedCountries: { type: String, default: "" },
    excludedCountries: { type: String, default: "" },
    includedStates: { type: String, default: "" },
    excludedStates: { type: String, default: "" },
    includedCities: { type: String, default: "" },
    excludedCities: { type: String, default: "" },
    includedPincodes: { type: String, default: "" },
    excludedPincodes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaypalIntegration", paypalIntegrationSchema);
