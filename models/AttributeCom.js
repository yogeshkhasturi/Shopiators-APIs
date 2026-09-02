const mongoose = require("mongoose");

const attributeComSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },

    attributes: {
      type: Map,
      of: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    attributeDetails: [
      {
        attributeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Attribute",
        },
        attributeName: String,
        attributeValueId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "AttributeValue",
        },
        attributeValueName: String,
        colorCode: String,
      },
    ],

    price: Number,
    salePrice: Number,
    stock: Number,
    sku: String,
    storeSlug: { type: String, required: true, unique: false },
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AttributeCom", attributeComSchema);