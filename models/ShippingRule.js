const mongoose = require("mongoose");

const ShippingMethodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  notes: { type: String, default: "" },
  enabled: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },
  pricing: {
    type: { type: String, enum: ["fixed", "free", "calculated"], default: "fixed" },
    amount: { type: Number, default: 0 },
  },
  rules: {
    includeCountries: [{ type: String }],
    excludeCountries: [{ type: String }],
    includeStates: [{ type: String }],
    excludeStates: [{ type: String }],
    includeCities: [{ type: String }],
    excludeCities: [{ type: String }],
    includeZipcodes: [{ type: String }],
    excludeZipcodes: [{ type: String }],

    minOrderValue: { type: Number },
    maxOrderValue: { type: Number },
    freeShippingMinOrderValue: { type: Number },
    minWeight: { type: Number },
    maxWeight: { type: Number },
    minQuantity: { type: Number },
    maxQuantity: { type: Number },

    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    collectionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Collection" }],
    vendorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Assuming User/Seller model for vendor
    shippingClassIds: [{ type: String }], // Assuming we might have a shipping class model later, storing string IDs for now
  },
});

const ShippingRuleSchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true, unique: true },
    shippingMethods: [ShippingMethodSchema],
  },
  { timestamps: true, collection: "shippingrules" }
);

module.exports = mongoose.model("ShippingRule", ShippingRuleSchema);
