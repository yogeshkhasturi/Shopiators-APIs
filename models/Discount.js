const mongoose = require("mongoose");

const DiscountSchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true },
    code: { type: String, required: true },
    method: { type: String, enum: ["code", "automatic"], default: "code" },
    title: { type: String },
    type: { type: String, required: true }, // e.g. amount_off_products, buy_x_get_y...
    typeName: { type: String },
    valueType: { type: String }, // percentage, fixed, free
    value: { type: Number },
    minRequirement: { type: String }, // none, amount, quantity
    minRequirementValue: { type: Number },
    status: { type: String, default: "active" }, // active, disabled, scheduled, expired
    usageCount: { type: Number, default: 0 },
    startDate: { type: String },
    endDate: { type: String },
    appliesTo: { type: String }, // all, products, collections
    details: { type: String },
    
    // Applies To Specifics
    selectedProductIds: [{ type: String }],
    selectedCollectionIds: [{ type: String }],
    
    // Buy X Get Y Specifics
    buyQty: { type: Number },
    buyProductId: { type: String },
    getQty: { type: Number },
    getProductId: { type: String },
    buyGetYType: { type: String },
    buyGetYVal: { type: String },
    combination: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Discount", DiscountSchema);
