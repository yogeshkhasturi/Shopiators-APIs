const mongoose = require("mongoose");

/* ─── Return ID counter helper ─── */
const ReturnCounter = new mongoose.Schema({ storeSlug: String, seq: { type: Number, default: 0 } });
const ReturnCounterModel = mongoose.models.ReturnCounter || mongoose.model("ReturnCounter", ReturnCounter);

/**
 * Generates next returnId like "RR-0042"
 * Uses a separate counter doc per storeSlug (atomic, race-condition safe)
 */
async function generateReturnId(storeSlug) {
    const counter = await ReturnCounterModel.findOneAndUpdate(
        { storeSlug },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return `RR-${String(counter.seq).padStart(4, "0")}`;
}

/* ─── Status Enum ─── */
const RETURN_STATUSES = [
    "PendingApproval",
    "Approved",
    "PickupScheduled",
    "SelfShipInitiated",
    "Received",
    "InspectionPassed",
    "Rejected",
    "RefundInitiated",
    "RefundCompleted",
    "ExchangeCreated",
    "ExchangeShipped",
    "Completed",
];

/* ─── Timeline Entry Sub-Schema ─── */
const TimelineEntrySchema = new mongoose.Schema(
    {
        status: { type: String, enum: RETURN_STATUSES },
        note: { type: String, default: "" },
        performedBy: { type: String }, // userId or adminId
        performedByRole: { type: String, enum: ["customer", "admin"], default: "admin" },
        timestamp: { type: Date, default: Date.now },
    },
    { _id: false }
);

/* ─── Per-Item Sub-Schema ─── */
const ReturnItemSchema = new mongoose.Schema(
    {
        orderItemId: { type: String }, // _id of cart item in Order.cartItems
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        variantId: { type: mongoose.Schema.Types.ObjectId, ref: "AttributeCom" }, // selected variant
        title: { type: String },
        image: [{ type: String }],
        price: { type: Number },
        quantity: { type: Number, required: true, min: 1 },
        type: { type: String, enum: ["refund", "exchange", "return"], required: true },
        reason: { type: String, required: true },
        images: [{ type: String }], // proof images from customer
        attributeDetails: [{ type: Object }], // snapshot of variant attributes
    },
    { _id: true }
);

/* ─── Exchange Details Sub-Schema ─── */
const ExchangeDetailsSchema = new mongoose.Schema(
    {
        newVariantId: { type: mongoose.Schema.Types.ObjectId, ref: "AttributeCom" },
        newProductId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        newTitle: { type: String },
        newImage: [{ type: String }],
        newPrice: { type: Number },
        priceDifference: { type: Number, default: 0 },
        differenceType: {
            type: String,
            enum: ["payable", "refundable", "none"],
            default: "none",
        },
        replacementItems: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
                variantId: { type: mongoose.Schema.Types.ObjectId, ref: "AttributeCom" },
                quantity: { type: Number },
                price: { type: Number },
                title: { type: String },
                image: [{ type: String }],
                attributeDetails: [{ type: Object }],
            },
        ],
        paymentId: { type: String },
        paymentMethod: { type: String },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },
        exchangeOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        }, // populated after exchange order is created
    },
    { _id: false }
);

/* ─── Bank Details Sub-Schema ─── */
const BankDetailsSchema = new mongoose.Schema(
    {
        accountHolder: { type: String },
        accountNumber: { type: String },
        ifsc: { type: String },
        bankName: { type: String },
    },
    { _id: false }
);

/* ─── Main ReturnRequest Schema ─── */
const ReturnRequestSchema = new mongoose.Schema(
    {
        returnId: {
            type: String,
            unique: true,
            index: true,
        },

        storeSlug: {
            type: String,
            required: true,
            index: true,
        },

        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            index: true,
        },

        customOrderId: { type: String }, // human-readable order ID like "#1001"

        userId: {
            type: String,
            index: true,
        },

        guestEmail: { type: String },

        /* ─── Items being returned / exchanged ─── */
        items: [ReturnItemSchema],

        /* ─── Refund Details ─── */
        refundMethod: {
            type: String,
            enum: ["bank", "upi", "store-credit", "manual", "original_method"],
        },
        bankDetails: BankDetailsSchema,
        upiId: { type: String },

        /* ─── Exchange Details ─── */
        exchangeDetails: ExchangeDetailsSchema,

        /* ─── Replacement Items (for admin-initiated exchanges) ─── */
        replacementItems: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
                variantId: { type: mongoose.Schema.Types.ObjectId, ref: "AttributeCom" },
                quantity: { type: Number },
                price: { type: Number },
                title: { type: String },
                image: [{ type: String }],
                attributeDetails: [{ type: Object }],
            },
        ],

        /* ─── Customer Comment ─── */
        customerComment: { type: String, default: "" },

        /* ─── State Machine Status ─── */
        status: {
            type: String,
            enum: RETURN_STATUSES,
            default: "PendingApproval",
            index: true,
        },

        /* ─── Admin Notes ─── */
        adminNotes: { type: String, default: "" },

        /* ─── Audit Timeline ─── */
        timeline: [TimelineEntrySchema],

        /* ─── Shipping Details ─── */
        shippingType: { type: String, enum: ["upload_label", "url_label", "no_shipping"], default: "upload_label" },
        shippingLabel: { type: String }, // File name or URL
        trackingNumber: { type: String },
        shippingCarrier: { type: String },

        /* ─── Stock reservation flag (for exchanges) ─── */
        stockReserved: { type: Boolean, default: false },
    },
    { timestamps: true }
);

/* ─── Pre-save: generate returnId if not set ─── */
ReturnRequestSchema.pre("save", async function (next) {
    if (!this.returnId) {
        this.returnId = await generateReturnId(this.storeSlug || "default");
    }
    next();
});

/* ─── Export ─── */
module.exports = mongoose.model("ReturnRequest", ReturnRequestSchema);
module.exports.RETURN_STATUSES = RETURN_STATUSES;
