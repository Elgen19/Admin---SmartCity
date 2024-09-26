const crypto = require('crypto');
const nodemailer = require('nodemailer');
const firebase = require('../config/firebase'); // Import firebase setup
const db = firebase.database();

// Send invite to a new admin
exports.sendInvite = async (req, res) => {
  const { email } = req.body;

  // Assuming you have middleware that sets req.user for authenticated admins
  const adminId = req.user ? req.user.id : null; // Ensure adminId exists

  if (!adminId) {
    return res.status(401).json({ message: 'Unauthorized. Admin not authenticated' });
  }

  try {
    // Check if an admin already exists with the provided email
    const existingAdminRef = await db.ref('Admins').orderByChild('email').equalTo(email).once('value');
    const existingAdmin = existingAdminRef.val();

    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email already exists.' });
    }

    // Generate token and set expiration (24 hours)
    const token = crypto.randomBytes(32).toString('hex');
    const expiration = Date.now() + 24 * 60 * 60 * 1000;

    // Save the invitation in Firebase Realtime Database
    await db.ref('invitations').push({
      email,
      token,
      expiration,
      invitedBy: adminId,
    });

    // Configure nodemailer for sending email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Generate the signup link (you can replace with your frontend URL)
    const signupLink = `http://localhost:3000/signup?token=${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Admin Invitation',
      text: `You have been invited to join as an admin. Click the link to sign up: ${signupLink}. This link will expire in 24 hours.`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Invitation sent!' });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ message: 'Error sending invitation' });
  }
};





// Verify the invitation token
exports.verifyInvite = async (req, res) => {
  const { token } = req.query;

  try {
    // Retrieve invitation based on the token
    const invitationRef = await db.ref('invitations').orderByChild('token').equalTo(token).once('value');
    const invitation = invitationRef.val();

    if (!invitation) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const inviteData = Object.values(invitation)[0]; // Get the first invitation object

    // Check if the token has expired
    if (inviteData.expiration < Date.now()) {
      return res.status(400).json({ message: 'Token has expired' });
    }

    // Token is valid
    res.status(200).json({ message: 'Token is valid', email: inviteData.email });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ message: 'Error verifying invitation token' });
  }
};



