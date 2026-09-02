const mongoose = require("mongoose");

/**
 * Store-wide Return & Exchange configuration.
 * One document per storeSlug.
 */
const ReturnSettingsSchema = new mongoose.Schema(
    {
        storeSlug: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        /* ─── Feature Toggles ─── */
        returnsEnabled: { type: Boolean, default: true },
        exchangesEnabled: { type: Boolean, default: true },
        exchangeType: {
            type: String,
            enum: ["all_products", "same_product",],
            default: "all_products",
        },

        /* ─── Time Window ─── */
        returnWindowDays: { type: Number, default: 7 },

        /* ─── Logistics ─── */
        reversePickupEnabled: { type: Boolean, default: false },

        /* ─── Validation Rules ─── */
        imageRequiredForDamage: { type: Boolean, default: true },
        allowPartialReturns: { type: Boolean, default: true },

        /* ─── Refund Methods available to customers ─── */
        allowedRefundMethods: {
            type: [String],
            enum: ["bank", "upi", "store-credit", "manual"],
            default: ["bank", "upi"],
        },

        /* ─── Return Reasons (store can customize) ─── */
        returnReasons: {
            type: [String],
            default: [
                "Defective / Damaged",
                "Wrong item received",
                "Size / Fit issue",
                "Not as described",
                "Changed my mind",
                "Other",
            ],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ReturnSettings", ReturnSettingsSchema);
