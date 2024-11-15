const crypto = require('crypto');
const handlebars = require('handlebars');
const fs = require('fs');
const firebase = require('../config/firebase'); // Import firebase setup
const db = firebase.database();
const transporter = require('../config/mailConfig'); // Import the transporter from mailConfig
const { timeStamp } = require('console');

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
    const existingAdminRef = await db.ref('admins').orderByChild('email').equalTo(email).once('value');
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

    // Generate the signup link
    const signupLink = `https://admin-smart-city.vercel.app/signup?token=${token}`;

    // Read the Handlebars template
    const templateSource = fs.readFileSync('templates/adminInvitation.hbs', 'utf8');
    const template = handlebars.compile(templateSource);

    // Generate the email HTML
    const emailHTML = template({ signupLink });

    // Setup email data
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Admin Invitation',
      html: emailHTML, // Use the generated HTML from the template
    };

    // Send email using the transporter from mailConfig
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


module.exports = {
  sendInvite,
  verifyInvite
};