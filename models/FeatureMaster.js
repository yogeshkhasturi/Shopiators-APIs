const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    key: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, required: true },
    types: [{ 
      type: String, 
      enum: ['Sidebar', 'Route', 'API', 'Pricing Card'] 
    }],
    displayOrder: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['Active', 'Inactive'], 
      default: 'Active' 
    }
  },
  { timestamps: true }
);

featureSchema.index({ category: 1 });
featureSchema.index({ status: 1 });

// Use "features" collection but name the mongoose model "FeatureMaster"
// to avoid colliding with the legacy Feature.js model in Merchant Admin memory
module.exports = mongoose.model('FeatureMaster', featureSchema, 'features');
