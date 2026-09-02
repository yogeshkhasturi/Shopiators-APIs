const mongoose = require("mongoose");

const contactSettingSchema = new mongoose.Schema(
  {
    storeSlug:{type:String, required:true, unique:false},
    heading: { type: String },
    email: { type: String },
    mobileNo: { type: Number },
    address: { type: String },
    mapFrame: { type: String },
    metaKeywords: { type: String }, 
    metaTitle: { type: String },
    metaDescription: { type: String }, 

  },
  { timestamps: true }
);
  
module.exports = mongoose.model("ContactSetting", contactSettingSchema);
