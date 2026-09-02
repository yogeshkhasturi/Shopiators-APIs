const mongoose = require("mongoose");

const bankTransferSettingSchema = new mongoose.Schema({
    enable: { type: Boolean, default: false },
    bankName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    accountHolderName: { type: String, default: "" },
    ifscCode: { type: String, default: "" },
    swiftCode: { type: String, default: "" },
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

module.exports = mongoose.model("BankTransferSetting", bankTransferSettingSchema);
