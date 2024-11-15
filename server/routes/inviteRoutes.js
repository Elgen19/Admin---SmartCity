// server/routes/inviteRoutes.js
const express = require('express');
const { sendInvite, verifyInvite } = require('../controllers/inviteController');
const authenticate = require('../middleware/authMiddleware'); // Import your auth middleware
const router = express.Router();

router.use(authenticate); // Apply authentication middleware


router.post('/send-invite', sendInvite.sendInvite);
router.get('/verify-invite', verifyInvite.verifyInvite);

module.exports = router;
