const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    currency: { type: String, default: 'INR', uppercase: true },
    pricing: {
      monthly: { type: Number, required: true, default: 0 },
      yearly: { type: Number, required: true, default: 0 },
      discountMode: { type: String, enum: ['manual', 'percentage'], default: 'manual' },
      discountPercentage: { type: Number, default: 0 }
    },
    badge: { type: String, default: '' },
    color: { type: String, default: '' },
    pricingFeatures: { type: [String], default: [] },
    trialDays: { type: Number, default: 0 },
    sortOrder: { type: Number, default: 0 }, // for display ordering
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    version: { type: Number, default: 1 },
    status: { 
      type: String, 
      enum: ['Draft', 'Publishing', 'Published', 'Partial Sync', 'Failed', 'Archived'], 
      default: 'Draft' 
    },
  },
  { timestamps: true }
);

planSchema.index({ slug: 1, version: 1 }, { unique: true });
planSchema.index({ status: 1 });

module.exports = mongoose.model('Plan', planSchema);
