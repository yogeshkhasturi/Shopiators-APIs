const mongoose = require("mongoose");

const ProductReviewSchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true, unique: false },
    productId: { type: String, required: true, },
    userId: { type: String, default: null },
    name: { type: String, required: true, },
    email: { type: String, required: true, },
    reviewMessage: { type: String, required: true, },
    reviewValue: { type: Number, required: true, },
    image: [{ type: String, default: "" }], // Add image field (optional)
  },
  { timestamps: true }
);

// Prevent duplicate reviews from same email for the same product in the same store
ProductReviewSchema.index({ email: 1, productId: 1, storeSlug: 1 }, { unique: true });

module.exports = mongoose.model("ProductReview", ProductReviewSchema);



