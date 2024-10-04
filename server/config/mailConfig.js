// config/mailConfig.js
const nodemailer = require('nodemailer');

// Create a transporter object using your email service configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // Change this to your email service
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

// Test if the transporter is created successfully
transporter.verify((error, success) => {
  if (error) {
    console.error('Transporter verification failed:', error);
  } else {
    console.log('Transporter is ready to send emails.');
  }
});

// Export the transporter
module.exports = transporter;
