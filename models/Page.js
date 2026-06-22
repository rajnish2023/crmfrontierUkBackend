const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: Object, required: true }, // Puck JSON data
    status: { type: String, enum: ['Draft', 'Published'], default: 'Published' },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
    metaImage: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Page', pageSchema);
