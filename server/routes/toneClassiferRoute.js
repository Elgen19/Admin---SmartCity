const express = require("express");
const {analyzeFeedbackBasedOnTone } = require("../controllers/toneClassifierController");
const router = express.Router();

// Define the route for analyzing feedback
router.post("/analyze-feedback-tone", analyzeFeedbackBasedOnTone);

module.exports = router;
