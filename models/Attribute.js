const mongoose = require("mongoose");

const attributeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  attributeset: { type: mongoose.Schema.Types.ObjectId, ref:"AttributeSet" }, // adjust type as needed
  values: [{ type: mongoose.Schema.Types.ObjectId, ref: "AttributeValue" }],
  storeSlug:{type:String, required:true, unique:false},
}, { timestamps: true });

module.exports = mongoose.model("Attribute", attributeSchema);
