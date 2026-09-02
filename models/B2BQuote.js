const mongoose = require("mongoose");

const B2BQuoteItemSchema = new mongoose.Schema({
  productId: { type: String },
  productTitle: { type: String },
  variantTitle: { type: String, default: "" },
  attributes: { type: String, default: "" },
  image: { type: String, default: "" },
  quantity: { type: Number, default: 1 },
  targetPrice: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
});

const B2BQuoteSchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true },
    productId: { type: String },
    productTitle: { type: String },
    variantTitle: { type: String, default: "" },
    attributes: { type: String, default: "" },
    items: [B2BQuoteItemSchema],
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, default: "" },
    companyName: { type: String, default: "" },
    quantity: { type: Number, default: 1 },
    targetPrice: { type: Number, default: 0 },
    message: { type: String, default: "" },
    status: { type: String, default: "pending" },
    adminNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("B2BQuote", B2BQuoteSchema);
