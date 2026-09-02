const mongoose = require("mongoose");

const AutoCancellationSettingSchema = new mongoose.Schema(
    {
        storeSlug: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        autoApproveCancellation: {
            type: Boolean,
            default: false,
        },
        cancellationReasons: {
            type: [String],
            default: [
                "Order created by mistake",
                "Item(s) not needed anymore",
                "Found better price elsewhere",
                "Delivery time too long",
                "Wrong shipping address",
                "Payment issue",
                "Other",
            ],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AutoCancellationSetting", AutoCancellationSettingSchema);
