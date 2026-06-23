const mongoose = require("mongoose");

const openGraphSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    image: String,
    type: String,
  },
  { _id: false }
);

const twitterSchema = new mongoose.Schema(
  {
    card: String,
    title: String,
    description: String,
    image: String,
  },
  { _id: false }
);

const seoSchema = new mongoose.Schema(
  {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,
    metaImage: String,

    seoTitle: String,
    seoDescription: String,

    canonicalUrl: String,
    robotsMeta: String,

    openGraph: openGraphSchema,

    twitter: twitterSchema,

    jsonLd: String,
  },
  { _id: false }
);

const pageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    content: {
      type: Object, // Puck JSON data
      required: true,
    },

    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Published",
    },

    seo: seoSchema,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Page", pageSchema);
