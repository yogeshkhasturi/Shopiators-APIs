const mongoose = require("mongoose");

const migrationCredentialSchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true },
    platform: { type: String, required: true },
    encryptedAccessToken: { type: String, required: true },
    iv: { type: String },
    authData: { type: mongoose.Schema.Types.Mixed }, // Safe masked metadata (e.g., store URL)
    isValid: { type: Boolean, default: true },
  },
  { timestamps: true }
);

migrationCredentialSchema.index({ storeSlug: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model("MigrationCredential", migrationCredentialSchema);
