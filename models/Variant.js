const mongoose=require("mongoose");

const variantSchema = new mongoose.Schema({  
  storeSlug:{type:String, required:true, unique:false},
    productId: {
      type:mongoose.Schema.Types.ObjectId, 
       ref: "Product"
    },
    attributes: {
      type:Object,
      default:{}
    },
  price:{
    type:Number,
    default:0
  },
  salePrice:{
    type:Number,
    default:0
  },
    stock: {
      type:Number,
      default:1
    },
    sku: {
type:String,
default:""
    }

});

module.exports=mongoose.model("Variant",variantSchema)  