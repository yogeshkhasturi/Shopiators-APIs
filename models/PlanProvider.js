const mongoose = require('mongoose');

const planProviderSchema = new mongoose.Schema(
    {
        planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
        provider: { type: String, enum: ['STRIPE', 'RAZORPAY'], required: true },
        enabled: { type: Boolean, default: true },

        // Stripe specific
        stripeProductId: { type: String },
        stripeMonthlyPriceId: { type: String },
        stripeYearlyPriceId: { type: String },

        // Razorpay specific (Plans no longer synced to Razorpay per Token architecture)
        
        providerMetadata: { type: mongoose.Schema.Types.Mixed, default: {} },
        syncStatus: {
            type: String,
            enum: ['Pending', 'Syncing', 'Synced', 'Failed', 'Archived'],
            default: 'Pending'
        },
        lastSyncedAt: { type: Date },
        errorMessage: { type: String },
    },
    { timestamps: true }
);

planProviderSchema.index({ planId: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('PlanProvider', planProviderSchema);
