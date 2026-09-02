// models/Cart.js
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true, unique: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, default: 1 },

        // ✅ Store snapshot product details
        title: { type: String },
        image: [{ type: String }],
        price: { type: Number },
        salePrice: { type: Number },
        totalStock: { type: Number },
        handle: { type: String },
        sku: { type: String },
        // ✅ Store selected attribute combination
        selectedVariant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "AttributeCom",
          default: null,
        },
        selectedOptions: {
          type: Map,
          of: mongoose.Schema.Types.ObjectId, // Store AttributeValue IDs
        },
        attributeCombinations:
        {
          type: Array,
          default: [],
        },

        // ✅ Readable details for attributes
        attributeDetails: [
          {
            attributeId: { type: mongoose.Schema.Types.ObjectId, ref: "Attribute" },
            attributeName: String,
            attributeValueId: { type: mongoose.Schema.Types.ObjectId, ref: "AttributeValue" },
            attributeValueName: String,
          },
        ],
      },
    ],
    lastUpdated: { type: Date, default: Date.now },
    isAbandoned: {
      type: Boolean,
      default: false,
    },
    reminders: {
      count: { type: Number, default: 0 },
      lastSentAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
