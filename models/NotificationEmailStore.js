const mongoose = require("mongoose");

const notificationEmailStoreSchema = new mongoose.Schema(
    {
        senderEmail: { type: String, default: "" },
        senderName: { type: String, default: "" },
        receiverEmail: { type: String, default: "" },
        emailLogo: { type: String, default: "" },
        primaryColor: { type: String, default: "#000000" },
        secondaryColor: { type: String, default: "#ffffff" },
        storeSlug: { type: String, required: true, unique: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("NotificationEmailStore", notificationEmailStoreSchema);
