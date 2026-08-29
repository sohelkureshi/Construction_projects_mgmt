const express = require("express");
const Link = require("../model/Link");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const links = await Link.find({});
    res.json(links);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, driveUrl } = req.body;
    const newLink = new Link({ title, driveUrl });
    await newLink.save();
    res.status(201).json(newLink);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add link" });
  }
});

module.exports = router;
