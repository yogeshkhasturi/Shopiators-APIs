const mongoose = require("mongoose");

const ContactInquirySchema = new mongoose.Schema(
    {
        storeSlug: {
            type: String,
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["unread", "read"],
            default: "unread",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ContactInquiry", ContactInquirySchema);
