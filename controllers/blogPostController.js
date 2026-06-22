const BlogPost = require('../models/BlogPost');
const BlogCategory = require('../models/BlogCategory');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/uploads'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  
  },
});

// Initialize multer with file filter
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif|webp/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Create a new blog post with auth user 

const createBlogPost = async (req, res) => {
    const author = req.user;
    const { title, slug, excerpt, content, category, metaTitle, metaDescription, metakeywords, status, schema } = req.body;
  
    const banner = req.files.banner ? req.files.banner[0] : null;
    const metaimage = req.files.metaimage ? req.files.metaimage[0] : null;
  
    if (!title || !slug || !excerpt || !content || !category || !author) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if slug already exists
    const existingPost = await BlogPost.findOne({ slug });
    if (existingPost) {
      return res.status(400).json({ error: 'Slug already exists. Please use a unique slug.' });
    }

    const parsedSchema = typeof schema === 'string' ? JSON.parse(schema) : schema || [];
   
    // Calculate reading time
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const readTime = Math.ceil(words / wordsPerMinute);



    const newPost = new BlogPost({
      title,
      slug,
      excerpt,
      content,
      category,
      author: author,
      metaTitle,
      metaDescription,
      metakeywords,
      status,
      banner: banner ? banner.filename : '',    
      metaimage: metaimage ? metaimage.filename : '', 
      readtimes: readTime,
      schema: parsedSchema
    });
  
    try {
      const savedPost = await newPost.save();
      res.status(201).json(savedPost);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create blog post', details: error.message });
    }
  };

// Get all blog posts with auth user but when role is superadmin then fetch all blogs
const BlogPostsAll = async (req, res) => {
    try {
      let blogPosts;

      if (req.user.role === 'superAdmin') {
        blogPosts = await BlogPost.find().populate('category').populate('author');
      } else {
        blogPosts = await BlogPost.find({ author: req.user._id }).populate('category').populate('author');
      }

      res.status(200).json(blogPosts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  




// fetch all blog posts by auth user
const getBlogPostsByUser = async (req, res) => {
  try {
    const blogPosts = await BlogPost.find({ author: req.user._id }).populate('category');

    res.status(200).json(blogPosts);
  } catch (error) {
    console.error('Error fetching blog posts by user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

//Get a single blog post by id
const getBlogPostById = async (req, res) => {
    try {
      const blogPost = await BlogPost.findById(req.params.id)
        .populate('category')
        .populate('author');
  
      if (!blogPost) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
  
      res.status(200).json(blogPost);
    } catch (error) {
      console.error('Error fetching blog post by id:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

// Get a single blog post by slug
const getBlogPostBySlug = async (req, res) => {
  try {
    const blogPost = await BlogPost.findOne({ slug: req.params.slug })
      .populate('category')
      .populate('author');

    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.status(200).json(blogPost);
  } catch (error) {
    console.error('Error fetching blog post by slug:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update a blog post by Id with auth user
const updateBlogPost = async (req, res) => {
  const author = req.user._id;
    try {
       
      const { title, slug, excerpt, content, category, metaTitle, metaDescription, metakeywords, status,schema } = req.body;
  
      const parsedSchema = typeof schema === 'string' ? JSON.parse(schema) : schema || [];
       
      if (!title || !slug || !content || !category || !author) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Check if slug already exists for another post
      const existingPost = await BlogPost.findOne({ slug, _id: { $ne: req.params.id } });
      if (existingPost) {
        return res.status(400).json({ message: 'Slug already exists. Please use a unique slug.' });
      }
  
       
      let banner, metaimage;
  
      
      if (req.files && req.files.banner) {
        banner = req.files.banner[0].filename;  
      }
  
       
      if (req.files && req.files.metaimage) {
        metaimage = req.files.metaimage[0].filename;  
      }
  
       // Calculate reading time
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const readTime = Math.ceil(words / wordsPerMinute);
       
      const updatedBlogPost = await BlogPost.findByIdAndUpdate(
        req.params.id,  
        {
          title,
          slug,
          excerpt,
          content,
          category,
          metaTitle,
          metaDescription,
          metakeywords,
          status,
          author: author,
          banner: banner || undefined,  
          metaimage: metaimage || undefined, 
          readtimes: readTime,
          schema: parsedSchema
        },
        { new: true }  
      );
  
       
      if (!updatedBlogPost) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
  
       
      res.status(200).json({ message: 'Blog post updated successfully', blogPost: updatedBlogPost });
    } catch (error) {
      console.error('Error updating blog post:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  


// Delete a blog post by slug
const deleteBlogPost = async (req, res) => {
  try {
    const deletedBlogPost = await BlogPost.findOneAndDelete({ slug: req.params.slug });

    if (!deletedBlogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.status(200).json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  createBlogPost,
  BlogPostsAll,
  getBlogPostBySlug,
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
  getBlogPostsByUser,
  upload,  
};
