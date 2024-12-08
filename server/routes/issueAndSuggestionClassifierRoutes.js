const express = require("express");
const { classifyAndSummarizeFeedback } = require("../controllers/issueAndSuggestionClassifierController");

// Create a router instance
const router = express.Router();

/**
 * @route POST /api/classify-feedback
 * @description Classify feedback into Issues and Suggestions and summarize them
 * @access Public (or Protected, if authentication is required)
 */
router.post("/classify-feedback", classifyAndSummarizeFeedback);

module.exports = router;
