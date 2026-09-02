const mongoose = require("mongoose");

const gstandcgstSchema = new mongoose.Schema({
  status: { type: String ,enum: ["included", "excluded"], default: "included" },
  gst: { type: Number, default: "" },
  cgst:{type:Number,default:""},
  storeSlug:{type:String, required:true, unique:false},
});

module.exports = mongoose.model("GstAndCgst", gstandcgstSchema);