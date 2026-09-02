const mongoose = require("mongoose");

const facebookSchema = new mongoose.Schema({
  appId: { type: String, required: true },
  accessToken: { type: String, required: true },
  catalogId: {type:String,required:true},
  createdAt: { type: Date, default: Date.now },
  storeSlug:{type:String, required:true, unique:false},
});

module.exports = mongoose.model("Facebook", facebookSchema);

