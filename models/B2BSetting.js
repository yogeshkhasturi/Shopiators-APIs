const mongoose = require("mongoose");

/**
 * Store-wide B2B / Wholesale configuration.
 * One document per storeSlug.
 */
const B2BSettingSchema = new mongoose.Schema(
  {
    storeSlug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    /* ─── Feature Toggles ─── */
    isEnabled: { type: Boolean, default: false },
    hidePrices: { type: Boolean, default: false },
    hideAddToCart: { type: Boolean, default: false },
    requireLogin: { type: Boolean, default: false },
    enableQuoteNegotiation: { type: Boolean, default: false },
    enablePriceNegotiation: { type: Boolean, default: false },
    enableQuoteWidget: { type: Boolean, default: true },
    sendEmailToMerchant: { type: Boolean, default: true },
    sendEmailToCustomer: { type: Boolean, default: true },
    merchantEmail: { type: String, default: "" },

    /* ─── Messaging & Customization ─── */
    customQuoteMessage: {
      type: String,
      default: "Interested in bulk purchasing or wholesale pricing? Request a custom quote below.",
    },
    quoteButtonText: {
      type: String,
      default: "Request a Quote",
    },
    requireLoginMessage: {
      type: String,
      default: "Please log in to view wholesale prices and catalog.",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("B2BSetting", B2BSettingSchema);
