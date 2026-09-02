const mongoose = require("mongoose");

const preOrderSettingSchema = new mongoose.Schema(
  {
    storeSlug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    productEligibility: {
      type: String,
      enum: ["all_products", "selected_products", "selected_collections"],
      default: "all_products",
    },
    productScope: {
      type: String,
      enum: ["all_products", "selected_products", "selected_collections"],
      default: "all_products",
    },
    selectedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    selectedCollections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection",
      },
    ],
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    launchDate: {
      type: Date,
      default: null,
    },
    maxQuantity: {
      type: Number,
      default: null,
    },
    paymentOption: {
      type: String,
      enum: ["full", "partial"],
      default: "full",
    },
    partialPaymentPercentage: {
      type: Number,
      default: null,
    },
    emailOnOrder: {
      type: Boolean,
      default: true,
    },
    emailOnLaunch: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PreOrderSetting", preOrderSettingSchema);
