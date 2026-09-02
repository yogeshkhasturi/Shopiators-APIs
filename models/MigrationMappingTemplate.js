const mongoose = require("mongoose");

const migrationMappingTemplateSchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true },
    sourcePlatform: { type: String, required: true },
    entityType: { type: String, required: true }, // e.g., 'products', 'customers'
    mappings: { type: mongoose.Schema.Types.Mixed, default: {} },
    relationships: { type: mongoose.Schema.Types.Mixed, default: {} },
    name: { type: String }, // optional name for the template
  },
  { timestamps: true }
);

module.exports = mongoose.model("MigrationMappingTemplate", migrationMappingTemplateSchema);
