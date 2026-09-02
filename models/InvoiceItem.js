const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema(
  {
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", required: true, index: true },
    chargeId: { type: mongoose.Schema.Types.ObjectId, ref: "Charge" }, // Optional link to the originating charge
    
    title: { type: String, required: true },
    description: { type: String },
    
    type: { 
      type: String, 
      enum: ["plan", "manual_charge", "recurring_addon", "one_time_charge", "credit", "discount", "tax", "custom"], 
      required: true 
    },
    
    quantity: { type: Number, required: true, default: 1 },
    unitPrice: { type: Number, required: true },
    amount: { type: Number, required: true }, // quantity * unitPrice (can be negative for discounts/credits)
    
    recurring: { type: Boolean, default: false },
    taxable: { type: Boolean, default: true },
    
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model("InvoiceItem", invoiceItemSchema);
