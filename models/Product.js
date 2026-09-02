const e = require("express");
const mongoose = require("mongoose");

const toObjectId = (v) => (v === "" || v === undefined || v === null ? null : v);

const productSchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true, unique: false },
    image: [{ type: String }],
    status: { type: String, enum: ["active", "disabled"], default: "active" },
    badge: { type: String },
    title: { type: String, required: true },
    handle: { type: String, default: "" },
    description: { type: String },
    selectedCollection: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection",
        set: toObjectId,
      },
    ],
    attributeSet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttributeSet",
      set: toObjectId,
    },
    attributeRows: [
      {
        attribute: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Attribute",
          set: toObjectId,
        },
        attributeValue: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AttributeValue",
            set: toObjectId,
          },
        ],
      },
    ],
    attributeCombinations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AttributeCom",
        set: toObjectId,
      },
    ],
    price: { type: Number },
    salePrice: { type: Number },
    totalStock: { type: Number },
    variants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variant",
        set: toObjectId,
      },
    ],
    options: {
      type: Array,
      default: [],
    },
    metaKeywords: { type: String },
    metaTitle: { type: String },
    metaDescription: { type: String },
    sizeChart: { type: String },
    syncedToMeta: {
      type: Boolean,
      default: false
    },
    /* ── Return & Exchange product-level override ── */
    returnConfig: {
      useGlobalConfig: { type: Boolean, default: true }, // true = use store ReturnSettings
      returnable: { type: Boolean },
      exchangeable: { type: Boolean },
      customReturnWindow: { type: Number }, // days; overrides store setting if useGlobalConfig=false
    },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
