const mongoose = require("mongoose");

const previewTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    storeSlug: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        index: { expires: 0 }, // TTL index to automatically delete expired tokens
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("PreviewToken", previewTokenSchema);
