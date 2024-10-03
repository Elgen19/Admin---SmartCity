// /routes/sendRoutes.js
const express = require('express');
const { sendContentToAudience } = require('../controllers/sendController');
const router = express.Router();

// Route to send content via email
router.post('/send-content', sendContentToAudience);

module.exports = router;
