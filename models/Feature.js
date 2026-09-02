const mongoose = require("mongoose");

const FeatureSchema = new mongoose.Schema(
  {
    image: String,
     order: { type: Number, default: 0 }, // 🆕 Order flag
    storeSlug:{type:String, required:true, unique:false},
  },

  { timestamps: true }
);

module.exports = mongoose.model("Feature", FeatureSchema);
