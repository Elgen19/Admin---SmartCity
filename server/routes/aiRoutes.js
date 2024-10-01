// routes/aiRoutes.js
const express = require("express");
const { analyzeFeedback } = require("../controllers/aiControllers");
const router = express.Router();

// Define the route for analyzing feedback
router.get("/analyze-feedback", analyzeFeedback);

module.exports = router;
