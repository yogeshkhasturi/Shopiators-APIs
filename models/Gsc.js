const mongoose = require("mongoose");

const gscSchema = new mongoose.Schema({
  gscId: { type: String, default: "" },
  storeSlug:{type:String, required:true, unique:false},
});

module.exports = mongoose.model("Gsc", gscSchema);
