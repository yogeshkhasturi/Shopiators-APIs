const mongoose = require("mongoose");

const termconditionSettingSchema = new mongoose.Schema(
  {
    description: { type: String },
    metaKeywords: { type: String }, 
    metaTitle: { type: String },
    metaDescription: { type: String },
    storeSlug:{type:String, required:true, unique:false},
  },
  { timestamps: true }
);
  
module.exports = mongoose.model("TermConditionSetting", termconditionSettingSchema);
