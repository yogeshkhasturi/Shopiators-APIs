const mongoose = require("mongoose");

const AdminInAppNotificationSchema = new mongoose.Schema(
    {
        storeSlug: {
            type: String,
            required: true,
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        customOrderId: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AdminInAppNotification", AdminInAppNotificationSchema);
