const mongoose = require("mongoose");

const BingWebmasterSchema = new mongoose.Schema(
  {
    bingId: {
      type: String,
      required: true,
    },
    storeSlug:{type:String, required:true, unique:false},
  },
  { timestamps: true }
);

module.exports = mongoose.model("BingWebmaster", BingWebmasterSchema);
