const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenId: { type: String, required: true, unique: true, index: true },
    tokenHash: { type: String, required: true },
    familyId: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    storeSlug: { type: String, required: true, index: true },
    scopes: [{ type: String }],
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, default: null },
    replacedByTokenId: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);

