// server/routes/inviteRoutes.js
const express = require('express');
const inviteController = require('../controllers/inviteController');
const authenticate = require('../middleware/authMiddleware'); // Import your auth middleware
const router = express.Router();

router.use(authenticate); // Apply authentication middleware


router.post('/send-invite', inviteController.sendInvite);
router.get('/verify-invite', inviteController.verifyInvite);

module.exports = router;
