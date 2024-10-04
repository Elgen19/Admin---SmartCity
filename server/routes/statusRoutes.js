// routes/aiRoutes.js
const express = require("express");
const { analyzeFeedback, sendAccountStatusEmail } = require("../controllers/statusController");
const router = express.Router();

// Define the route for analyzing feedback
router.get("/send-status", sendAccountStatusEmail);

module.exports = router;
