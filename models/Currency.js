const mongoose = require("mongoose");

const currencySchema = new mongoose.Schema({
  code: { type: String, required: true,  },
  name: { type: String, required: true },
  symbol: { type: String },
//   decimal: { type: Number },
//   groupSeparator: {
//     type: String,
//     match: /^[.,’\s]?$/, // restricts to allowed chars
//   },
  decimalSeparator: {
    type: String,
    match: /^[.,]?$/,
  },
  currencyPosition: {
    type: String,
    enum: ["left", "left-space", "right", "right-space"],
    default: "left",
  },
  storeSlug:{type:String, required:true, unique:false},
});

module.exports = mongoose.model("Currency", currencySchema);
