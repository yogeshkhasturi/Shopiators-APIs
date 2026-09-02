const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    set: v => v === "" ? undefined : v
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user",
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  businessName: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  gstNumber: {
    type: String,
  },
  panNumber: {
    type: String,
  },
  businessType: {
    type: String,
  },
  address: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  pincode: {
    type: String,
  },
  resetPasswordToken: { type: String },
  storeSlug: { type: String, required: true },
  resetPasswordExpire: { type: Date },
  resetAttempts: { type: Number, default: 0 },
  firstResetAttemptAt: { type: Date },
}, { timestamps: true });

// Compound unique indexes for uniqueness per store and role
UserSchema.index(
  { email: 1, storeSlug: 1, role: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { email: { $type: "string" } } 
  }
);
UserSchema.index({ userName: 1, storeSlug: 1, role: 1 }, { unique: true });

const User = mongoose.model("User", UserSchema);
module.exports = User;
