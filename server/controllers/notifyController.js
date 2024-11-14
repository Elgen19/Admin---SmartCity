const transporter = require('../config/mailConfig');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

// Load Handlebars template
const loadTemplate = (templateName, context) => {
    const templatePath = path.join(__dirname, '../templates', `${templateName}.hbs`);
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);
    return template(context);
};

// Helper for equality comparison
handlebars.registerHelper('eq', function (a, b) {
    return a === b;
});

// Send notification email
const sendNotificationEmail = async (req, res) => {
    const { email, name, action } = req.body; // Destructure the values from req.body
    let subject, message;

    console.log('Received data:', { email, name, action });

    // Determine email subject and body based on action
    if (action === 'approve') {
        subject = 'Admin Approval Notification';
        message = 'Your request to become an admin has been approved.';
    } else if (action === 'deny') {
        subject = 'Admin Denial Notification';
        message = 'We regret to inform you that your request to become an admin has been denied. If you have any questions, please feel free to reach out.';
    } else {
        console.error('Invalid action provided:', action);
        return res.status(400).send('Invalid action'); // Return an error response
    }

    const html = loadTemplate('accountStatusMail', { subject, name, message, action });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email, // Use the email parameter here
        subject: subject,
        html: html, // Set HTML body
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
