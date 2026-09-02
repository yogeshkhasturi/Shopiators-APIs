const mongoose = require("mongoose");

const toObjectId = (v) => (v === "" || v === undefined || v === null ? null : v);

const collectionSchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true, unique: false },
    title: {
      type: String,
      default: "",
    },
    handle: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    collectionType: {
      type: String,
      enum: ["manual", "smart"],
      default: "manual",
    },
    selectedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        set: toObjectId,
      },
    ],
    selectedSmartProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        set: toObjectId,
      },
    ],
    parentCollection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
      set: toObjectId,
    },
    childCollection: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection",
      }
    ],
    matchType: {
      type: String,
      enum: ["all condition", "any condition"],
      default: "all condition"
    },
    conditions: [
      {
        field: String,
        operator: String,
        value: String,
      },
    ],
    metaKeywords: { type: String },
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Collection", collectionSchema);