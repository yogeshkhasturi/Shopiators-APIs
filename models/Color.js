const mongoose = require("mongoose");

const colorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    hex: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v) {
          return /^#([0-9a-fA-F]{3}){1,2}$/.test(v);
        },
        message: props => `${props.value} is not a valid hex color code!`
      }
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    storeSlug: { type: String, required: true, unique: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Color", colorSchema);
