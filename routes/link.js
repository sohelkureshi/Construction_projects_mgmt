const express = require('express');
const router = express.Router();
const Link = require('../model/Link');

// GET: Retrieve all links
router.get('/links', async (req, res) => {
  try {
    const links = await Link.find({});
    // Return as JSON if using AJAX or render a view if doing classic SSR
    res.json(links);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// POST: Add new link
router.post('/links', async (req, res) => {
  try {
    const { title, driveUrl } = req.body;
    const newLink = new Link({ title, driveUrl });
    await newLink.save();
    // Return the saved link as JSON
    res.status(201).json(newLink);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add link' });
  }
});

module.exports = router;