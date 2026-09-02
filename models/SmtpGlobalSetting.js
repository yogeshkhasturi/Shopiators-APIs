const mongoose = require("mongoose");

const smtpGlobalSettingSchema = new mongoose.Schema(
    {
        smtpHost: { type: String, default: "" },
        smtpPort: { type: Number, default: 465 },
        smtpSecure: { type: Boolean, default: true },
        smtpUsername: { type: String, default: "" },
        smtpPassword: { type: String, default: "" }, // Will be encrypted/hidden in UI
        storeSlug: { type: String, required: true, unique: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("SmtpGlobalSetting", smtpGlobalSettingSchema);
