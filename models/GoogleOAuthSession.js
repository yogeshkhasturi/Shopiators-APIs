const mongoose = require("mongoose");

const googleOAuthSessionSchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true, unique: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GoogleOAuthSession", googleOAuthSessionSchema);
