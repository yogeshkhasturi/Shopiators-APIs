const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: String,
    cartId: String,
    storeSlug: { type: String, required: true, unique: false },
    customOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    isImported: {
      type: Boolean,
      default: false,
    },
    historicalRefundAmount: {
      type: Number,
      default: 0
    },
    cartItems: [
      {
        productId: String,
        title: String,
        image: [String],
        price: Number,
        quantity: Number,
        fulfilledQuantity: { type: Number, default: 0 },
        refundedQuantity: { type: Number, default: 0 },
        sku: String,
        isPreOrder: {
          type: Boolean,
          default: false,
        },
        launchDate: {
          type: Date,
        },
        selectedVariant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "AttributeCom",
        },
        selectedOptions: {
          type: Object,
          default: {},
        },

        attributeDetails: [
          {
            attributeId: String,
            attributeName: String,
            attributeValueId: String,
            attributeValueName: String,
          }
        ],
      },
    ],



    /* 🔥 ADD THESE 3 FIELDS HERE */
    isExchangeOrder: {
      type: Boolean,
      default: false,
    },
    exchangeFromOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    exchangeFromProductId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    exchangeOldReturnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReturnRequest",
    },
    isPartialCod: {
      type: Boolean,
      default: false,
    },
    partialAdvanceAmount: {
      type: Number,
      default: 0,
    },
    remainingCodAmount: {
      type: Number,
      default: 0,
    },
    addressInfo: Object,
    shippingAddress: Object,
    billingAddress: Object,
    contactEmail: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    notes: String,
    tags: [String],

    orderStatus: { type: String, default: "pending" },
    paymentMethod: String,
    paymentStatus: String,
    subTotal: Number,
    shippingCharge: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    discountCode: String,
    gstAmount: { type: Number, default: 0 },
    cgstAmount: { type: Number, default: 0 },
    gstPercent: Number,
    cgstPercent: Number,
    totalAmount: Number,
    currency: String,
    orderDate: Date,
    orderUpdateDate: Date,
    paymentId: String,
    payerId: String,

    bankTransferDetails: {
      referenceNumber: String,
      receiptUrl: String,
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
      },
      verificationRemarks: String,
      verifiedAt: Date,
    },

    upiDetails: {
      utrNumber: String,
      screenshotUrl: String,
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
      },
      verificationRemarks: String,
      verifiedAt: Date,
    },

    refund: {
      isRequested: { type: Boolean, default: false },
      reason: String,
      method: { type: String, enum: ["bank", "upi"] },
      bankDetails: {
        name: String,
        account: String,
        ifsc: String,
      },
      upiId: String,
      images: [String],
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
      },
      adminRemark: String,          // ✅ ADD
      requestedDate: Date,
      processedDate: Date,
    },

    return: {
      isRequested: { type: Boolean, default: false },
      reason: String,
      type: { type: String, enum: ["refund", "exchange"] },
      exchangeWith: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      images: [String],
      requestedAt: Date,
      status: {
        type: String,
        enum: ["pending", "approved", "declined"],
        default: "pending",
      },
      adminRemark: String,          // ✅ ADD
      processedDate: Date,          // ✅ ADD
    },

    cancel: {
      isRequested: { type: Boolean, default: false },
      reason: { type: String },
      adminCancelReason: { type: String },
      images: [String],
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
      },
      adminRemark: String,          // ✅ ADD
      requestedDate: Date,
      processedDate: Date,
    },

    trackingInfo: [
      {
        trackingNumber: String,
        shippingCarrier: String,
        trackingUrl: String,
      },
    ],

  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
