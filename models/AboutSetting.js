const mongoose = require("mongoose");

const aboutSettingSchema = new mongoose.Schema(
  {
    storeSlug:{type:String, required:true, unique:false},
    heading:{type:String},
    subHeading:{type:String},
    description: { type: String },
    image:{type:String},
    middleHeading:{type:String},
    middleSubHeading1:{type:String},
    middleSubHeading2:{type:String},
    metaKeywords: { type: String }, 
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
); 
  
module.exports = mongoose.model("AboutSetting", aboutSettingSchema);