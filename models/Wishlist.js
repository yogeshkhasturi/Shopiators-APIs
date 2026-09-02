const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
    {
        storeSlug: { type: String, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        items: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
                title: String,
                image: [String],
                price: Number,
                salePrice: Number,
                totalStock: Number,
                handle: String,
                addedAt: { type: Date, default: Date.now }
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Wishlist", wishlistSchema);
