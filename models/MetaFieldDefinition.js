const mongoose = require("mongoose");

const metaFieldDefinitionSchema = new mongoose.Schema(
    {
        // Human-readable label for the metafield
        label: {
            type: String,
            required: true,
            trim: true,
        },

        // Machine-readable key (e.g., "fabric_type")
        key: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        // Namespace for organizing metafields (default: "custom")
        namespace: {
            type: String,
            default: "custom",
            trim: true,
            lowercase: true,
        },

        // Data type of the metafield value
        type: {
            type: String,
            required: true,
            enum: ["text", "number", "boolean", "date", "json", "richtext"],
        },

        // Which entity type this metafield can be attached to
        appliesTo: {
            type: String,
            required: true,
            enum: ["product", "collection", "blog", "user"],
        },

        // Multi-store isolation
        storeSlug: {
            type: String,
            required: true,
            index: true,
        },

        // Optional validation rules (e.g., { min: 0, max: 100, regex: "..." })
        validationRules: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },

        // Optional description for admin UI
        description: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

// Compound unique index: prevent duplicate keys within same store + namespace
metaFieldDefinitionSchema.index(
    { storeSlug: 1, namespace: 1, key: 1 },
    { unique: true }
);

// Index for fast lookup by store and entity type
metaFieldDefinitionSchema.index({ storeSlug: 1, appliesTo: 1 });

module.exports = mongoose.model("MetaFieldDefinition", metaFieldDefinitionSchema);
