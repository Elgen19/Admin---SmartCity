const express = require('express');
const {sendNotificationEmail } = require('../controllers/notifyController');

const router = express.Router();

// Route to check if a user exists by email
router.post('/email-admin', sendNotificationEmail);

module.exports = router;
