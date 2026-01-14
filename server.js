const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB connect
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blog_api';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
  });

// Blog schema and model
const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Body is required'],
      trim: true,
    },
    author: {
      type: String,
      default: 'Anonymous',
      trim: true,
    },
  },
  { timestamps: true }
);

const Blog = mongoose.model('Blog', blogSchema);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Blog API is running' });
});

// Create a new blog post
app.post('/blogs', async (req, res) => {
  try {
    const { title, body, author } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Title and body are required',
      });
    }

    const blog = new Blog({ title, body, author });
    const savedBlog = await blog.save();
    return res.status(201).json(savedBlog);
  } catch (err) {
    console.error('Error creating blog:', err);
    return res.status(500).json({
      error: 'Server error',
      message: 'Failed to create blog post',
    });
  }
});

// Get all blog posts
app.get('/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return res.status(200).json(blogs);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    return res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch blog posts',
    });
  }
});

// Get a single blog post by ID
app.get('/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Provided blog ID is not valid',
      });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Blog post not found',
      });
    }

    return res.status(200).json(blog);
  } catch (err) {
    console.error('Error fetching blog:', err);
    return res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch blog post',
    });
  }
});

// Update a blog post by ID
app.put('/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body, author } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Provided blog ID is not valid',
      });
    }

    if (!title || !body) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Title and body are required',
      });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { title, body, author },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Blog post not found',
      });
    }

    return res.status(200).json(updatedBlog);
  } catch (err) {
    console.error('Error updating blog:', err);
    return res.status(500).json({
      error: 'Server error',
      message: 'Failed to update blog post',
    });
  }
});

// Delete a blog post by ID
app.delete('/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Provided blog ID is not valid',
      });
    }

    const deletedBlog = await Blog.findByIdAndDelete(id);
    if (!deletedBlog) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Blog post not found',
      });
    }

    return res.status(200).json({
      message: 'Blog post deleted successfully',
      id: deletedBlog._id,
    });
  } catch (err) {
    console.error('Error deleting blog:', err);
    return res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete blog post',
    });
  }
});

//404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'Route not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Server error',
    message: 'Something went wrong',
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


