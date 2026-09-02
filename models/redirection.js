const mongoose = require("mongoose");

const RedirectionSchema = new mongoose.Schema(
  {
    notFound: { type: String, default: "home" }, // 404 redirect type
    notFoundCollection: { type: String, default: "" }, // handle if collection selected
    serverError: { type: String, default: "home" }, // 503 redirect type
    serverErrorCollection: { type: String, default: "" }, // handle if collection selected
    enabled: { type: Boolean, default: true },
    storeSlug: { type: String, required: true, unique: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Redirection", RedirectionSchema);
