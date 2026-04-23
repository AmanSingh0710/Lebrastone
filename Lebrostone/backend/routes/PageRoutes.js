const express = require('express');
const router = express.Router();

const BusinessPage = require('../models/BussinesPages');

// Helper to generate unique slug
const generateUniqueSlug = async (baseSlug) => {
  let slug = baseSlug;
  let counter = 1;
  
  while (await BusinessPage.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

// Create or Update a page (upsert)
router.post('/add', async (req, res) => {
  const { description, pageName } = req.body;

  if (!pageName || !description) {
    return res.status(400).json({
      success: false,
      message: "pageName and description are required"
    });
  }

  try {
    // Generate slug from pageName
    const baseSlug = pageName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check for existing page with same pageName
    let page = await BusinessPage.findOne({ pageName });

    if (page) {
      // Update existing page
      page.description = description;
      await page.save();
      
      return res.status(200).json({
        success: true,
        message: "Page Updated! ✍️",
        data: page
      });
    } else {
      // Check if slug already exists
      let slug = baseSlug;
      const existingSlug = await BusinessPage.findOne({ slug });
      
      if (existingSlug) {
        // Generate unique slug
        let counter = 1;
        while (await BusinessPage.findOne({ slug: `${baseSlug}-${counter}` })) {
          counter++;
        }
        slug = `${baseSlug}-${counter}`;
      }

      // Create new page with slug
      page = new BusinessPage({ pageName, description, slug });
      await page.save();
      
      return res.status(201).json({
        success: true,
        message: "Page Created! ✍️",
        data: page
      });
    }

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// Get all pages
router.get('/all', async (req, res) => {
  try {
    const pages = await BusinessPage.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: pages
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// Get all unique page names
router.get('/names', async (req, res) => {
  try {
    const pageNames = await BusinessPage.distinct('pageName');
    
    res.status(200).json({
      success: true,
      data: pageNames
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// Get a specific page by pageName
router.get('/:pageName', async (req, res) => {
  try {
    const { pageName } = req.params;
    const page = await BusinessPage.findOne({ pageName: decodeURIComponent(pageName) });
    
    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: page
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// Update a page by pageName
router.put('/:pageName', async (req, res) => {
  try {
    const { description } = req.body;
    const { pageName } = req.params;

    const page = await BusinessPage.findOneAndUpdate(
      { pageName: decodeURIComponent(pageName) },
      { description },
      { returnDocument: "after" }
    );

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Page Updated! ✍️",
      data: page
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// Delete a page by pageName
router.delete('/:pageName', async (req, res) => {
  try {
    const { pageName } = req.params;

    const page = await BusinessPage.findOneAndDelete({ pageName: decodeURIComponent(pageName) });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Page Deleted! 🗑️"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// Fix missing slugs in existing documents
router.post('/fix-slugs', async (req, res) => {
  try {
    const pagesWithoutSlug = await BusinessPage.find({ 
      $or: [
        { slug: null },
        { slug: { $exists: false } }
      ]
    });

    for (const page of pagesWithoutSlug) {
      const baseSlug = page.pageName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      let slug = baseSlug;
      let counter = 1;
      
      // Find unique slug
      while (await BusinessPage.findOne({ slug, _id: { $ne: page._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      page.slug = slug;
      await page.save();
    }

    res.status(200).json({
      success: true,
      message: `Fixed ${pagesWithoutSlug.length} pages`,
      data: pagesWithoutSlug.length
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;
