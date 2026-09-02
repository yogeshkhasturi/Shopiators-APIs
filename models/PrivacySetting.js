const mongoose = require("mongoose");

const privacySettingSchema = new mongoose.Schema(
  {storeSlug:{type:String, required:true, unique:false},
    privacyPolicy: { type: String }, 
    metaKeywords: { type: String }, 
    metaTitle: { type: String },
    metaDescription: { type: String }, 
  },
  { timestamps: true }
);
  
module.exports = mongoose.model("PrivacySetting", privacySettingSchema);