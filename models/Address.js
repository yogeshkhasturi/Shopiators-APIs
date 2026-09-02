const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },
     email: {
       type: String,
      trim: true,
      default: "",
    },

    // 🔹 Address breakdown
    house: {
      type: String,
      required: true,
      trim: true,
    },

    street: {
      type: String,
      required: true,
      trim: true,
    },

    landmark: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },
    state:{
      type: String,
      // required: true,

    },
    stateName: {
      type: String,
      required: true,
      trim: true,
    },
    country:{
      type: String,
      // required: true,
    },
      countryName: { 
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      maxLength: 20,
    },

    phone: {
      type: String,
      required: true,
    },

    storeSlug: {
      type: String,
      required: true,
      index: true,
    },
        // 🔹 Address type (NEW)
    addressType: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },

    // 🔹 Default address flag (NEW)
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", AddressSchema);
