const mongoose = require("mongoose");

const codSchema = new mongoose.Schema({
    enable: { type: Boolean, default: true },
    codCharges: { type: Number, default: 0 },
    storeSlug: { type: String, required: true, unique: true },
    enablePartialAdvance: { type: Boolean, default: false },
    advanceType: { type: String, enum: ["fixed", "percentage"], default: "fixed" },
    advanceValue: { type: Number, default: 0 },
    advanceValueFixed: { type: Number, default: 0 },
    advanceValuePercentage: { type: Number, default: 0 },
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

module.exports = mongoose.model("Cod", codSchema);
