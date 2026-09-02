// server/models/Template.js
const mongoose = require("mongoose");

const TemplateSchema = new mongoose.Schema({
  storeId: String,
  content: Array, // Store full Puck content array
  storeSlug: { type: String, required: true, unique: false },
});

module.exports = mongoose.model("Template", TemplateSchema);
