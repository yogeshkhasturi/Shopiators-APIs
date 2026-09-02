const mongoose = require("mongoose");

const captchaSettingSchema = new mongoose.Schema({
  enableInvisibleCaptcha: { type: Boolean, default: false },
  enableInvisibleCaptchaForGuests: { type: Boolean, default: false },
  ipWhitelist: { type: String, default: "" },
  captchaVersion: { type: String, default: "Version 3 Invisible" },
  siteKeyV2: { type: String, default: "" },
  secretKeyV2: { type: String, default: "" },
  siteKeyV2Invisible: { type: String, default: "" },
  secretKeyV2Invisible: { type: String, default: "" },
  siteKeyV2Checkbox: { type: String, default: "" },
  secretKeyV2Checkbox: { type: String, default: "" },
  siteKeyV3: { type: String, default: "" },
  secretKeyV3: { type: String, default: "" },
  captchaScore: { type: Number, default: 0.5 },
  errorMessage: { type: String, default: "Sorry, Google Recaptcha has detected you as a bot and restricted the access. Please contact the administrator in case you are not a bot." },
  language: { type: String, default: "en" },
  theme: { type: String, default: "Light" },
  position: { type: String, default: "Bottom Left" },
  storeSlug: { type: String, required: true },
});

module.exports = mongoose.model("CaptchaSetting", captchaSettingSchema);
