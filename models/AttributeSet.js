const mongoose = require("mongoose");

const attributesetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  storeSlug:{type:String, required:true, unique:false},
});

module.exports = mongoose.model("AttributeSet", attributesetSchema);
