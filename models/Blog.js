const { default: mongoose } = require("mongoose");

const toObjectId = (v) => (v === "" || v === undefined || v === null ? null : v);

const BlogSchema = new mongoose.Schema(
  {
    storeSlug: { type: String, required: true, unique: false },
    name: { type: String },
    description: { type: String },
    slug: { type: String },
    content: { type: String },
    image: { type: String },
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BlogCategory",
        set: toObjectId,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogAuthor",
      set: toObjectId,
    },
    metaKeywords: { type: String },
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", BlogSchema);