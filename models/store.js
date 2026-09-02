const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        storeSlug: {
            type: String,
            required: true,
            unique: true,
        },
        tenantId: {
            type: String,
            required: true,
            unique: true,
        },
        storeName: {
            type: String,
            required: true,
        },
        businessName: {
            type: String,
            required: true,
        },
        businessType: {
            type: String,
        },
        industry: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        targetAudience: {
            type: String,
        },
        uniqueValue: {
            type: String,
        },
        storeVibe: {
            type: String,
        },
        brandColors: {
            primary: String,
            secondary: String,
        },
        productCount: String,
        logoStyle: String,
        config: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        images: [String],
        logo: String,
        status: {
            type: String,
            enum: ["generating", "active", "locked", "suspended", "archived"],
            default: "active",
        },
        billingSnapshot: {
            plan: {
                _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
                slug: String,
                name: String
            },
            billingState: {
                type: String,
                enum: ["FREE", "TRIAL", "PAID", "EXPIRED", "CANCELLED", "PAST_DUE", "SUSPENDED"],
                default: "TRIAL",
            },
            subscriptionStatus: String,
            trialEndsAt: Date,
            features: {
                type: mongoose.Schema.Types.Mixed,
                default: {},
            },
            limits: {
                type: mongoose.Schema.Types.Mixed,
                default: {},
            },
            // Legacy fields for backward compatibility
            status: String,
            planSlug: String,
            expiresAt: Date
        },
        currentSubscriptionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subscription",
        },
        storeUrl: String,
        onboardingDone: {
            type: Boolean,
            default: false,
        },
        cachePurgeRequired: {
            type: Boolean,
            default: false,
        },
        generatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const Store = mongoose.model("Store", storeSchema);
module.exports = Store;