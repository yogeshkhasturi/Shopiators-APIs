const mongoose = require("mongoose");

const shiprocketSchema = new mongoose.Schema({
  email: { type: String,   },
  password: { type: String, },
  storeSlug:{type:String, required:true, unique:false},
});

module.exports = mongoose.model("ShipRocket", shiprocketSchema);