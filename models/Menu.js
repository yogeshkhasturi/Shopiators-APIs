const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  title: {
    type: String,
    // required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  link: {
    type: {
      type: String,
      enum: ["custom", "collection", "product", "page", "blog", "home"],
      default: "custom",
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  fontSize: {
    type: String,
    default: "14px",
  },
  megaMenu: {
    type: Boolean,
    default: false,
  },
  collectionHandle: {
    type: String,
    default: "",
  },
  children: [
    {
      title: {
        type: String,
        trim: true,
      },
      link: {
        type: {
          type: String,
          enum: ["custom", "collection", "product", "page", "blog", "home"],
          default: "custom",
        },
        value: String,
      },
    },
  ],
});

const menuSchema = new mongoose.Schema(
  {
    storeSlug: {
      type: String,
      required: true,
      index: true,
    },
    menuName: {
      type: String,
      required: true,
      trim: true,
    },
    menuHandle: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    menuItems: [menuItemSchema],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: String,
      default: "admin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Menu", menuSchema);