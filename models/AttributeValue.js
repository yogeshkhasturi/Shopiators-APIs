const mongoose = require("mongoose");
const attributeValueSchema = new mongoose.Schema({
  attribute: { type: mongoose.Schema.Types.ObjectId, ref: "Attribute", required: true },
  name: { type: String },   // primary field used by controller
  value: { type: String },                  // optional alias / legacy support
  hex: { type: String },                    // optional HEX code for color swatches
  status: { type: String, default: "active" },
  storeSlug: { type: String, required: true, unique: false },
}, { timestamps: true });

module.exports = mongoose.model("AttributeValue", attributeValueSchema);

