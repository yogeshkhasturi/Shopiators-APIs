const mongoose = require("mongoose");

const autoLoginTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        index: { expires: 0 }, // TTL index
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("AutoLoginToken", autoLoginTokenSchema);
