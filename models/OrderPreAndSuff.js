const mongoose = require("mongoose");

const preandsuffSchema = new mongoose.Schema({
  prefix: { type: String, default: "" },
  suffix: { type: String, default: "" },
  startNumber: { type: Number, default: 1, min: 1 },
  storeSlug: { type: String, required: true, unique: false },
});

module.exports = mongoose.model("PreAndSuff", preandsuffSchema);