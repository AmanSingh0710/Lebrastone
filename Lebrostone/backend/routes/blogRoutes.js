const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Blog = require('../models/Blog');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: 'public/uploads/blogs/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Add Blog
router.post('/add', protect, upload.single('image'), async (req, res) => {
    try {
        const { title, shortDescription, longDescription } = req.body;
        const newBlog = new Blog({
            title,
            shortDescription,
            longDescription,
            image: req.file ? `/uploads/blogs/${req.file.filename}` : ''
        });
        await newBlog.save();
        res.status(201).json({ success: true, message: "Blog Created! ✍️" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get All Blogs
router.get('/all', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get Single Blog by ID
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }
        res.json({ success: true, data: blog });
    } catch (err) { 
        res.status(500).json({ success: false, message: err.message }); 
    }
});

// Update Blog by ID
router.put('/update/:id', protect, upload.single('image'), async (req, res) => {
    try {
        const { title, shortDescription, longDescription } = req.body;
        const updateData = {
            title,
            shortDescription,
            longDescription
        };
        
        if (req.file) {
            updateData.image = `/uploads/blogs/${req.file.filename}`;
        }
        
        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            updateData,
            { returnDocument: "after" }
        );
        
        if (!updatedBlog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }
        
        res.json({ success: true, message: "Blog Updated! ✍️", data: updatedBlog });
    } catch (err) { 
        res.status(500).json({ success: false, message: err.message }); 
    }
});

// Delete Blog by ID
router.delete('/delete/:id', protect, async (req, res) => {
    try {
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
        
        if (!deletedBlog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }
        
        res.json({ success: true, message: "Blog Deleted! 🗑️" });
    } catch (err) { 
        res.status(500).json({ success: false, message: err.message }); 
    }
});

module.exports = router;