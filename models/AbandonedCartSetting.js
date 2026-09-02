const mongoose = require("mongoose");

const abandonedCartSettingSchema = new mongoose.Schema(
  {
    // Feature Control
    isActive: { type: Boolean, default: false },

    // Email Delay Configuration
    delayValue: { type: Number, default: 24 },
    delayUnit: {
      type: String,
      enum: ["seconds", "minutes", "hours", "days"],
      default: "hours",
      description: "Unit for delay calculation"
    },

    // Email Content
    emailSubject: { type: String, default: "Complete your purchase - Items waiting in your cart" },
    emailBody: { type: String, default: "You have items in your cart. Complete your purchase now!" },
    emailTemplate: { type: String, default: "" },

    // Reminder Configuration
    reminderFrequency: { type: Number, default: 24 },
    reminderFrequencyUnit: {
      type: String,
      enum: ["seconds", "minutes", "hours", "days"],
      default: "hours"
    },
    maxReminders: { type: Number, default: 3 },

    // Store Reference
    storeSlug: { type: String, required: true, unique: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AbandonedCartSetting", abandonedCartSettingSchema);

