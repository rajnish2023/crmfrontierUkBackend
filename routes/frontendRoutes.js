const express = require('express');
const BlogController = require('../controllers/FrontendController');

const router = express.Router();

// Route to fetch all blogs
router.get('/blogs', BlogController.getAllBlogs);

// Route to fetch all pages
router.get('/pages', BlogController.getAllPages);

// Route to fetch page details by slug
router.get('/pages/:slug', BlogController.getPageBySlug);

// Route to fetch blogs by category slug
router.get('/blogs/category/:category', BlogController.getBlogByCategorySlug);

// Route to fetch blogs by author
router.get('/blogs/author/:author', BlogController.getBlogsByAuthor);


//Route to fetch blog detaisl by slug 
router.get('/blogs/:slug', BlogController.getBlogBySlug);

// Route to fetch categories list 
router.get('/blog/categories', BlogController.getCategories);

// Route to get author list
router.get('/blog/authors', BlogController.getAuthors);


//route to show blog preview
router.get('/blogs/preview/:slug', BlogController.getBlogPreview);



 

module.exports = router;
