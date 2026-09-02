const mongoose = require("mongoose");

const OrderCounterSchema = new mongoose.Schema({
  storeSlug: {
    type: String,
    required: true,
    unique: true,
  },
  currentIndex: {
    type: Number,
    default: 100, // first order = 101
  },
});

module.exports = mongoose.model("OrderCounter", OrderCounterSchema);
