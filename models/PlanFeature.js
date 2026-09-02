const mongoose = require('mongoose');

const planFeatureSchema = new mongoose.Schema(
  {
    planId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Plan',
      required: true 
    },
    featureId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Feature', // Will reference FeatureMaster
      required: true 
    },
    showOnPricingCard: { type: Boolean, default: false },
    pricingDisplayOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

planFeatureSchema.index({ planId: 1, featureId: 1 }, { unique: true });
planFeatureSchema.index({ planId: 1 });

module.exports = mongoose.model('PlanFeature', planFeatureSchema);
