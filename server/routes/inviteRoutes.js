const express = require('express');
const {inviteController} = require('../controllers/inviteController');
const authenticate = require('../middleware/authMiddleware');
const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

router.post('/send-invite', inviteController.sendInvite);
router.get('/verify-invite', inviteController.verifyInvite);

module.exports = router;
