const mongoose = require("mongoose");

const BlogCategorySchema = new mongoose.Schema(
  {storeSlug:{type:String, required:true, unique:false},
    name:{type:String},
    description:{type:String},
    handle:{type:String},
    image:{type:String},
     metaTitle: { type: String },
  metaDescription: { type: String },
  metaKeywords: { type: String },
  },
  { timestamps: true }
); 
  
module.exports = mongoose.model("BlogCategory", BlogCategorySchema);