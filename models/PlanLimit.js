const mongoose = require('mongoose');

const planLimitSchema = new mongoose.Schema(
  {
    planId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Plan',
      required: true 
    },
    limitKey: { 
      type: String, 
      required: true,
      trim: true
    },
    value: { 
      type: mongoose.Schema.Types.Mixed, // Can be Number or String (e.g., -1 for unlimited)
      required: true 
    }
  },
  { timestamps: true }
);

planLimitSchema.index({ planId: 1, limitKey: 1 }, { unique: true });
planLimitSchema.index({ planId: 1 });

module.exports = mongoose.model('PlanLimit', planLimitSchema);
