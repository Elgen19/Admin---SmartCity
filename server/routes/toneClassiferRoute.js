// routes/aiRoutes.js
const express = require("express");
const { analyzeFeedback, analyzeFeedbackBasedOnTone } = require("../controllers/toneClassifierController");
const router = express.Router();

// Define the route for analyzing feedback
router.get("/analyze-feedback-tone", analyzeFeedbackBasedOnTone);

module.exports = router;
