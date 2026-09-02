const mongoose = require("mongoose");

const ga4Schema = new mongoose.Schema(
  {
    // Measurement ID (G-XXXXXXXXXX) — used by the GA4 tracking script injected into the storefront
    ga4Id: { type: String, default: "" },

    // GA4 Property resource name (e.g., "properties/123456789") — required by the GA4 Data API
    // This is populated by googleSave when the merchant selects a property via OAuth
    propertyId: { type: String, default: "" },

    // Human-readable property display name (stored for UI convenience)
    propertyName: { type: String, default: "" },

    storeSlug: { type: String, required: true, unique: false },
  },
  { timestamps: true }
);

ga4Schema.index({ storeSlug: 1 });

module.exports = mongoose.model("Ga4", ga4Schema);

