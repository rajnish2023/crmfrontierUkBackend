const express = require('express');
const router = express.Router();
const BlogPostController = require('../controllers/blogPostController');

const { authUser: authenticate } = require('../middleware/authMiddleware');

router.post('/blogpostcreate', BlogPostController.upload.fields([
    { name: 'banner', maxCount: 1 },  
    { name: 'metaimage', maxCount: 1 }, 
  ]), authenticate, BlogPostController.createBlogPost);

// Route to get all blog posts
router.get('/getposts', authenticate, BlogPostController.BlogPostsAll);


// Route to get a single blog post by its ID
router.get('/getblogpostbyId/:id', BlogPostController.getBlogPostById);

// Route to get a single blog post by its slug
router.get('/getblogpostbyslug/:slug', BlogPostController.getBlogPostBySlug);

// Route to update a blog post by its Id, including image uploads
router.patch('/updateblogpost/:id', BlogPostController.upload.fields([
  { name: 'banner', maxCount: 1 },
  { name: 'metaimage', maxCount: 1 },
]), authenticate, BlogPostController.updateBlogPost);

// Route to delete a blog post by its slug
router.delete('/deleteblogpost/:slug', BlogPostController.deleteBlogPost);

module.exports = router;
