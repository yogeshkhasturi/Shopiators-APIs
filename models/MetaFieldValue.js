const mongoose = require("mongoose");

const metaFieldValueSchema = new mongoose.Schema(
    {
        // Type of entity this metafield is attached to
        ownerType: {
            type: String,
            required: true,
            enum: ["product", "collection", "blog"],
        },

        // ID of the entity (Product, Collection, or Blog)
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },

        // Reference to the metafield definition
        definitionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MetaFieldDefinition",
            required: true,
            index: true,
        },

        // The actual value (type depends on definition.type)
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },

        // Multi-store isolation
        storeSlug: {
            type: String,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for fast lookup of all metafields for a specific entity
metaFieldValueSchema.index({ storeSlug: 1, ownerType: 1, ownerId: 1 });

// Compound unique index to prevent duplicate values for same entity + definition
metaFieldValueSchema.index(
    { storeSlug: 1, ownerId: 1, definitionId: 1 },
    { unique: true }
);


module.exports = mongoose.model("MetaFieldValue", metaFieldValueSchema);
