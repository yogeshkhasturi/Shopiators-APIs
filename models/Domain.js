const mongoose = require('mongoose');

const domainSchema = new mongoose.Schema(
  {
    storeSlug: {
      type: String,
      required: true,
      index: true
    },
    domain: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    type: {
      type: String,
      enum: ['default', 'custom'],
      default: 'custom'
    },
    provider: {
      type: String,
      enum: ['cpanel', 'cloudflare', 'aws', 'none'],
      default: 'cpanel'
    },
    verificationMethod: {
      type: String,
      enum: ['A', 'CNAME', 'TXT', 'none'],
      default: 'A'
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      default: 'pending'
    },
    sslStatus: {
      type: String,
      enum: ['pending', 'active', 'failed', 'none'],
      default: 'pending'
    },
    sslProvider: {
      type: String,
      enum: ['autossl', 'letsencrypt', 'acm', 'none'],
      default: 'autossl'
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    redirectToPrimary: {
      type: Boolean,
      default: true
    },
    lastVerifiedAt: {
      type: Date,
      default: null
    },
    connectedAt: {
      type: Date,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming User model tracks the admin/merchant who created it
      default: null
    },
    lastError: {
      type: String,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

// Ensure domain is unique across the entire system to avoid routing collisions
domainSchema.index({ domain: 1 }, { unique: true });

// Ensure a store doesn't have duplicate domains
domainSchema.index({ storeSlug: 1, domain: 1 }, { unique: true });

module.exports = mongoose.model('Domain', domainSchema);
