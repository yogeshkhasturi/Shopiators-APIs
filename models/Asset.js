const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true, unique: false },
    url: { type: String, required: true },
    altText: { type: String, default: "" },
    uploadedAt: { type: Date, default: Date.now },
    storeSlug:{type:String, required:true, unique:false},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Asset", assetSchema);
