const mongoose = require("mongoose");

const SellerSchema = new mongoose.Schema(
  {
storeSlug:{type:String, required:true, unique:false},
    paypal: {
      email: String,
      trackingId: String,
      merchantIdInPayPal: String,
      productIntentId: String,
      isEmailConfirmed: Boolean,
      primary_email_confirmed: Boolean,
      permissionsGranted: Boolean,
      consentStatus: Boolean,
      paymentsReceivable: Boolean,
      accountStatus: String,
      onboardingStatus: String,
      riskStatus: String,
      showOnCheckout: { type: Boolean, default: false },
      connected: { type: Boolean, default: false },
      lastSyncedAt: Date,
      webhookId: String,
      country: String,
      isIndianMerchant: Boolean,
      debugId: String,
      minOrderValue: { type: Number, default: 0 },
      maxOrderValue: { type: Number, default: 0 },
      includedCountries: { type: String, default: "" },
      excludedCountries: { type: String, default: "" },
      includedStates: { type: String, default: "" },
      excludedStates: { type: String, default: "" },
      includedCities: { type: String, default: "" },
      excludedCities: { type: String, default: "" },
      includedPincodes: { type: String, default: "" },
      excludedPincodes: { type: String, default: "" }
    }



  },
  { timestamps: true }
);

module.exports = mongoose.model("Seller", SellerSchema);

