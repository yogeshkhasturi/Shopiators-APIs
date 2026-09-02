const mongoose = require("mongoose");

const upiSettingSchema = new mongoose.Schema({
    enable: { type: Boolean, default: false },
    qrType: { type: String, enum: ["auto", "custom"], default: "auto" }, // "auto" for dynamic UPI URI generation, "custom" for custom URI or static QR
    upiId: { type: String, default: "" }, // UPI ID / VPA (e.g. 100hell@ibl)
    payeeName: { type: String, default: "" }, // Payee / Merchant Name (e.g. sohelstore)
    transactionNote: { type: String, default: "Order Payment" },
    autoUrl: { 
      type: String, 
      default: "upi://pay?pa={UPI_ID}&pn={PAYEE_NAME}&am={AMOUNT}&cu=INR&tr={ORDER_ID}&tn={TRANSACTION_NOTE}" 
    },
    customQrUrl: { type: String, default: "" }, // Custom UPI URI link or static QR URL (e.g. upi://pay?pa=100hell@ibl&pn=sohelstore...)
    qrCodeUrl: { type: String, default: "" }, // Static uploaded QR image URL
    instructions: { type: String, default: "" },
    storeSlug: { type: String, required: true, unique: true },
    minOrderValue: { type: Number, default: 0 },
    maxOrderValue: { type: Number, default: 0 },
    includedCountries: { type: String, default: "" },
    excludedCountries: { type: String, default: "" },
    includedStates: { type: String, default: "" },
    excludedStates: { type: String, default: "" },
    includedCities: { type: String, default: "" },
    excludedCities: { type: String, default: "" },
    includedPincodes: { type: String, default: "" },
    excludedPincodes: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("UpiSetting", upiSettingSchema);

