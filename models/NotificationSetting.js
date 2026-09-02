const mongoose = require("mongoose");

const notificationSettingSchema = new mongoose.Schema(
    {
        storeSlug: { type: String, required: true },
        emailType: {
            type: String,
            required: true,
            enum: ["order-confirmation", "order-shipped", "reset-password", "signup", "contact-us", "quote-submitted", "quote-status-update"]
        },
        subject: { type: String, required: true },
        template: { type: String, required: true }, // HTML content
        isActive: { type: Boolean, default: true },
        staffEmails: { type: [String], default: [] },
        staffSubject: { type: String, default: "" },
        staffTemplate: { type: String, default: "" },
    },
    { timestamps: true }
);

// Compound index to ensure one template type per store
notificationSettingSchema.index({ storeSlug: 1, emailType: 1 }, { unique: true });

module.exports = mongoose.model("NotificationSetting", notificationSettingSchema);
