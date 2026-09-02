const mongoose = require("mongoose");

const migrationMappingSchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true },
    sourcePlatform: { type: String, required: true },
    sourceEntityType: { type: String, required: true },
    sourceEntityId: { type: String, required: true },
    shopiatorsEntityType: { type: String, required: true },
    shopiatorsEntityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    migrationId: { type: mongoose.Schema.Types.ObjectId, ref: "MigrationJob" },
    sourceUpdatedAt: { type: Date },
    lastSyncedAt: { type: Date },
  },
  { timestamps: true }
);

// Unique index to map source entity to a specific destination entity type
migrationMappingSchema.index(
  {
    storeSlug: 1,
    sourcePlatform: 1,
    sourceEntityType: 1,
    sourceEntityId: 1,
    shopiatorsEntityType: 1,
  },
  { unique: true }
);

// Unique index to protect destination entity identity per platform
migrationMappingSchema.index(
  {
    storeSlug: 1,
    shopiatorsEntityType: 1,
    shopiatorsEntityId: 1,
    sourcePlatform: 1,
  },
  { unique: true }
);

module.exports = mongoose.model("MigrationMapping", migrationMappingSchema);
