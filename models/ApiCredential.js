const mongoose = require("mongoose");

const apiCredentialSchema = new mongoose.Schema(
  {
    providerId: { type: String, required: true },
    name: { type: String, required: true },
    keyId: { type: String, required: true, unique: true },
    secretHash: { type: String, required: true }, // Store hashed secret only
    storeSlug: { type: String, required: true }, // Associated store
    status: { type: String, enum: ["active", "revoked"], default: "active" },
    scopes: [{ type: String }], // Array of allowed scopes e.g. 'products:read'
    lastUsedAt: { type: Date },
    expiresAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ApiCredential", apiCredentialSchema);
