const firebase = require('firebase-admin');
const db = firebase.database();
const nodemailer = require('nodemailer');



exports.verifySignupInvite = async (req, res) => {
  console.log('Verify Signup Invite called with token:', req.query.token);
  const { token } = req.query;

  try {
    const invitationRef = await db.ref('invitations').orderByChild('token').equalTo(token).once('value');
    const invitation = invitationRef.val();

    if (!invitation) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const inviteData = Object.values(invitation)[0]; // Extract the first item

    if (inviteData.expiration < Date.now()) {
      return res.status(400).json({ message: 'Token has expired' });
    }

    // Token is valid
    res.status(200).json({ message: 'Token is valid', email: inviteData.email });
  } catch (error) {
    console.error('Error verifying invitation token:', error);
    res.status(500).json({ message: 'Error verifying invitation token', error: error.message });
  }
};

exports.signup = async (req, res) => {
  console.log('Sign Up called with data:', req.body);
  const { token, name, password, phoneNumber } = req.body;

  try {
    // Find the invitation in the Firebase Realtime Database
    const invitationRef = await db.ref('invitations').orderByChild('token').equalTo(token).once('value');
    const invitation = invitationRef.val();

    if (!invitation) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const inviteData = Object.values(invitation)[0]; // Get the first matching invitation
    const { email, expiration } = inviteData;

    if (expiration < Date.now()) {
      return res.status(400).json({ message: 'Token has expired' });
    }

    // Check if the email is already in use
    const userRecord = await firebase.auth().getUserByEmail(email).catch(error => {
      // If user doesn't exist, this error is expected
      if (error.code !== 'auth/user-not-found') {
        throw error; // Rethrow unexpected errors
      }
      return null; // Return null if user does not exist
    });

    if (userRecord) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // Create the user in Firebase Authentication
    const newUserRecord = await firebase.auth().createUser({
      email,
      password,
      displayName: name
    });

    // Save extra admin data in the Firebase Realtime Database
    await db.ref(`admins/${newUserRecord.uid}`).set({
      name,
      phoneNumber,
      email,
      invitedBy: inviteData.invitedBy,
      createdAt: Date.now(),
      isApproved: false,
      role: "Admin",
      access: "FEEDBACK_MANAGEMENT, HOME, CONTENT_MANAGEMENT, NOTIFICATIONS, ADMIN_PROFILE, TASK_MANAGEMENT",
      active: true,
    });

    // Send email verification link
    const verificationLink = await firebase.auth().generateEmailVerificationLink(email);
    await sendVerificationEmail(email, verificationLink);

    // Firebase automatically sends the verification email, no need to send manually

    // Delete the invitation once it's used
    await db.ref(`invitations/${Object.keys(invitation)[0]}`).remove();

    console.log(`Creating user with email: ${email}`);
    console.log(`User created: ${newUserRecord.uid}`);
    console.log(`Verification link generated: ${verificationLink}`);


    res.status(201).json({ message: 'Admin account created successfully. A verification email has been sent.' });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ message: 'Error creating account', error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { oobCode } = req.query; // Extract the oobCode from the query

  try {
    await firebase.auth().applyActionCode(oobCode); // Verify the email
    res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(400).json({ message: 'Invalid or expired verification link', error: error.message });
  }
};


async function sendVerificationEmail(email, verificationLink) {
    // Set up Nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail', // or any other email service
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Email',
        text: `Please verify your account by clicking the link: ${verificationLink}`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent to:', email);
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
}




