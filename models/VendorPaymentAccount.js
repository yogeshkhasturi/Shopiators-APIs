const mongoose = require("mongoose");

const VendorPaymentAccountSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // or "Seller", using User as it likely represents the account owner
            required: true,
        },
        storeSlug: {
            type: String,
            required: true,
        },
        provider: {
            type: String,
            enum: ["razorpay"],
            default: "razorpay",
            required: true,
        },
        razorpayAccountId: {
            type: String,
            required: true,
        },
        accessToken: {
            type: String,
            required: true,
        },
        refreshToken: {
            type: String,
            required: true,
        },
        tokenExpiry: {
            type: Date,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
        webhookSecret: {
            type: String,
        },
        rawResponse: {
            type: mongoose.Schema.Types.Mixed,
        },
    },
    { timestamps: true }
);

// Index for quick lookup by vendor and store
VendorPaymentAccountSchema.index({ vendorId: 1, storeSlug: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model("VendorPaymentAccount", VendorPaymentAccountSchema);
