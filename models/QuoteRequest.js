const mongoose = require("mongoose");

const QuoteRequestItemSchema = new mongoose.Schema({
  productId: { type: String },
  productTitle: { type: String },
  variantTitle: { type: String, default: "" },
  attributes: { type: String, default: "" },
  image: { type: String, default: "" },
  quantity: { type: Number, default: 1 },
  targetPrice: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
});

const QuoteRequestSchema = new mongoose.Schema(
  {
    storeSlug: {
      type: String,
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    productTitle: { type: String, required: true },
    variantTitle: { type: String, default: "" },
    attributes: { type: String, default: "" },
    items: [QuoteRequestItemSchema],
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, default: "" },
    companyName: { type: String, default: "" },
    quantity: { type: Number, required: true, default: 1 },
    targetPrice: { type: Number, default: 0 },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending",
    },
    adminNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuoteRequest", QuoteRequestSchema);
