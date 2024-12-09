const firebase = require('firebase-admin');
const nodemailer = require('nodemailer');
const serviceAccount = require('./firebaseServiceAccountKey.json'); // Adjust the path if necessary
require('dotenv').config();


// Initialize Firebase Admin SDK
if (!firebase.apps.length) {
  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: 'https://smartcity-6d63f-default-rtdb.firebaseio.com/', // Replace with your Firebase database URL
  });
}

const db = firebase.database();

const adminDetails = {
  email: 'dev.elgeniumone@gmail.com', // Replace with the admin's email
  password: 'qwerty12', // Replace with the admin's password
  name: 'Admin User', // Replace with the admin's name
  phoneNumber: '0912345678', // Replace with the admin's phone number
  invitedBy: 'ZmpGU6qIDGczTqvORi5hN4ZIjT22',
};

async function createAdminAccount() {
  try {
    console.log('Creating admin account...');

    // Check if email is already in use
    const existingUser = await firebase.auth().getUserByEmail(adminDetails.email).catch((error) => {
      if (error.code !== 'auth/user-not-found') {
        throw error; // Rethrow unexpected errors
      }
      return null; // Return null if user does not exist
    });

    if (existingUser) {
      console.error('Error: Email is already in use.');
      return;
    }

    // Create the user in Firebase Authentication
    const userRecord = await firebase.auth().createUser({
      email: adminDetails.email,
      password: adminDetails.password,
      displayName: adminDetails.name,
    });

    console.log(`User created successfully: ${userRecord.uid}`);

    // Save admin data in the Firebase Realtime Database
    await db.ref(`admins/${userRecord.uid}`).set({
      name: adminDetails.name,
      phoneNumber: adminDetails.phoneNumber,
      email: adminDetails.email,
      invitedBy: adminDetails.invitedBy,
      createdAt: Date.now(),
      isApproved: false,
      role: 'Admin',
      access: 'FEEDBACK_MANAGEMENT, HOME, CONTENT_MANAGEMENT, NOTIFICATIONS, ADMIN_PROFILE, TASK_MANAGEMENT, ACTIVATE_DEACTIVATE_ACCOUNTS, APPROVE_DENY_ADMIN_REGISTRATION, INVITE_NEW_ADMIN, PROMOTE_ADMIN, VIEW_USER_INFORMATION, ADMIN_ACTIVITY_LOGS, UPDATE_ADMIN_ACCESS',
      active: true,
    });

    // Generate an email verification link
    const verificationLink = await firebase.auth().generateEmailVerificationLink(adminDetails.email);
    console.log(`Verification link generated: ${verificationLink}`);

    // Send the verification email
    await sendVerificationEmail(adminDetails.email, verificationLink);

    console.log('Admin account created and email verification sent successfully.');
  } catch (error) {
    console.error('Error creating admin account:', error);
  }
}

async function sendVerificationEmail(email, verificationLink) {
  // Set up Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or any other email service
    auth: {
      user: process.env.EMAIL_USER, // Replace with your email user
      pass: process.env.EMAIL_PASS, // Replace with your email password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Admin Account',
    text: `Please verify your admin account by clicking the link: ${verificationLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
}

// Execute the script
createAdminAccount();
