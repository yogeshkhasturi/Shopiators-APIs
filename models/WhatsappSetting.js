const mongoose = require("mongoose");

const WhatsappSettingSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  accountName: { type: String, required: true },
  chatMessage: { type: String, required: true },
  placeholder: { type: String, required: true },
  status: { type: String, required: true },
  avatar: { type: String, default: "" },
  isEnabled: { type: Boolean, default: true },
  storeSlug:{type:String, required:true, unique:false},
}, { timestamps: true });

module.exports = mongoose.model("WhatsappSetting", WhatsappSettingSchema);
