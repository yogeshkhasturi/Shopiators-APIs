const mongoose = require("mongoose");

const socialLoginSettingSchema = new mongoose.Schema(
  {
    googleEnabled: { type: Boolean, default: false },
    googleClientId: { type: String, default: "" },
    googleClientSecret: { type: String, default: "" },
    facebookEnabled: { type: Boolean, default: false },
    facebookAppId: { type: String, default: "" },
    facebookAppSecret: { type: String, default: "" },
    storeSlug: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SocialLoginSetting", socialLoginSettingSchema);
