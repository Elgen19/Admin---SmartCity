// controllers/emailController.js

const transporter = require('../config/mailConfig');

// Send notification email
const sendNotificationEmail = async (req, res) => {
    const { email, name, action } = req.body; // Destructure the values from req.body
    let subject, text;
    
    console.log('Received data:', { email, name, action });

    // Determine email subject and body based on action
    if (action === 'approve') {
        subject = 'Admin Approval Notification';
        text = `Dear ${name},\n\nYour request to become an admin has been approved. You can now sign in using the following link: http://localhost:3000.\n\nThank you,\nAdmin Team`;
    } else if (action === 'deny') {
        subject = 'Admin Denial Notification';
        text = `Dear ${name},\n\nWe regret to inform you that your request to become an admin has been denied. If you have any questions, please feel free to reach out.\n\nThank you,\nAdmin Team`;
    } else {
        console.error('Invalid action provided:', action);
        return res.status(400).send('Invalid action'); // Return an error response
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email, // Use the email parameter here
        subject: subject,
        text: text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${email}`);
        return res.status(200).send('Email sent successfully'); // Send a success response
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).send('Error sending email'); // Return an error response
    }
};

module.exports = { sendNotificationEmail };
