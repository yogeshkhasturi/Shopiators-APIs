const mongoose = require("mongoose");

const BlogAuthorSchema = new mongoose.Schema(
  {storeSlug:{type:String, required:true, unique:false},
    name:{type:String},
    designation:{type:String},
    image:{type:String}
  },
  { timestamps: true }
); 
  
module.exports = mongoose.model("BlogAuthor", BlogAuthorSchema);