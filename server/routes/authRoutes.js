const express = require('express');
const { checkUserExistence } = require('../controllers/authControllers');

const router = express.Router();

// Route to check if a user exists by email
router.post('/check-user', checkUserExistence);

module.exports = router;
