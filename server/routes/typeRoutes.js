
const express = require("express");
const { analyzeFeedbackBasedOnType } = require("../controllers/typeClassifierController");
const router = express.Router();

// Define the route for analyzing feedback
router.post("/analyze-feedback-type", analyzeFeedbackBasedOnType);

module.exports = router;
