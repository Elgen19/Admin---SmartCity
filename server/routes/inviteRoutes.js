const express = require('express');
const { sendInvite, verifyInvite } = require('../controllers/inviteController');
const authenticate = require('../middleware/authMiddleware');
const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

router.post('/send-invite', sendInvite);
router.get('/verify-invite', verifyInvite);


module.exports = router;
