const mongoose = require("mongoose");

const paypalSchema = new mongoose.Schema({
  clientId: { type: String, required: true,  },
  clientSecret: { type: String, required: true },
  enable: {type:Boolean , default: true},
  storeSlug:{type:String, required:true, unique:false},
  webhookId: { type: String },
  minOrderValue: { type: Number, default: 0 },
  maxOrderValue: { type: Number, default: 0 },
  includedCountries: { type: String, default: "" },
  excludedCountries: { type: String, default: "" },
  includedStates: { type: String, default: "" },
  excludedStates: { type: String, default: "" },
  includedCities: { type: String, default: "" },
  excludedCities: { type: String, default: "" },
  includedPincodes: { type: String, default: "" },
  excludedPincodes: { type: String, default: "" },
});

module.exports = mongoose.model("Paypal", paypalSchema);
