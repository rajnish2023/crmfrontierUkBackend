const Page = require('../models/Page');

// Create a Page
exports.createPage = async (req, res) => {
  try {
    const { title, slug, content, status, metaTitle, metaDescription } = req.body;
    
    // Check if slug exists
    const existingPage = await Page.findOne({ slug });
    if (existingPage) {
      return res.status(400).json({ message: 'Slug already exists' });
    }

    const newPage = new Page({ title, slug, content, status, metaTitle, metaDescription });
    await newPage.save();
    
    res.status(201).json({ message: 'Page created successfully', page: newPage });
  } catch (error) {
    res.status(500).json({ message: 'Error creating page', error: error.message });
  }
};

// Get All Pages
exports.getPages = async (req, res) => {
  try {
    const pages = await Page.find().sort({ createdAt: -1 });
    res.status(200).json(pages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pages', error: error.message });
  }
};

// Get Page by ID
exports.getPageById = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    res.status(200).json(page);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching page', error: error.message });
  }
};

// Update Page
exports.updatePage = async (req, res) => {
  try {
    const { title, slug, content, status, metaTitle, metaDescription } = req.body;
    
    // Check if slug exists for another page
    if (slug) {
      const existingPage = await Page.findOne({ slug, _id: { $ne: req.params.id } });
      if (existingPage) {
        return res.status(400).json({ message: 'Slug already exists on another page' });
      }
    }

    const updatedPage = await Page.findByIdAndUpdate(
      req.params.id,
      { title, slug, content, status, metaTitle, metaDescription },
      { new: true }
    );
    
    if (!updatedPage) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    res.status(200).json({ message: 'Page updated successfully', page: updatedPage });
  } catch (error) {
    res.status(500).json({ message: 'Error updating page', error: error.message });
  }
};

// Delete Page
exports.deletePage = async (req, res) => {
  try {
    const page = await Page.findByIdAndDelete(req.params.id);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    res.status(200).json({ message: 'Page deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting page', error: error.message });
  }
};

// Get Page by Slug
exports.getPageBySlug = async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug });
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    res.status(200).json(page);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching page', error: error.message });
  }
};
