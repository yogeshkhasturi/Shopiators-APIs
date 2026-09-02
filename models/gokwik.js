const mongoose = require("mongoose");

const gokwikSchema = new mongoose.Schema({
  clientId: { type: String, required: true,  },
  clientSecret: { type: String, required: true },
  enable: {type:Boolean , default: true},
  storeSlug:{type:String, required:true, unique:false},
});

module.exports = mongoose.model("Gokwik", gokwikSchema);