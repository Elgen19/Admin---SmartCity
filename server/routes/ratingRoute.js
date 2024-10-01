const express = require("express");
const { getRatingStats } = require("../controllers/ratingControllers");

const router = express.Router();

// Route to get rating stats
router.get("/get-ratings", getRatingStats);

module.exports = router;
