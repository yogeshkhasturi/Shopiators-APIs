const mongoose = require("mongoose");

const razorpaySchema = new mongoose.Schema({
  key_id: { type: String, required: true, },
  key_secret: { type: String, required: true },
  enable: { type: Boolean, default: false },
  storeSlug: { type: String, required: true, unique: false },
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

module.exports = mongoose.model("Razorpay", razorpaySchema);
