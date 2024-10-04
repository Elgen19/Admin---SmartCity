const { transporter } = require('../config/mailConfig'); // Import the transporter
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

// Function to send activation/deactivation email
const sendAccountStatusEmail = async (req, res) => {
  const { email, fullName, isActive } = req.body; // Extracting data from req.body

  if (!email || !fullName || isActive === undefined) {
    return res.status(400).json({ message: 'Email, full name, and account status are required.' });
  }

  // Define messages based on the account status
  const statusMessage = isActive 
    ? `We are pleased to inform you that your account has been successfully activated.`
    : `We regret to inform you that your account has been successfully deactivated.`;

  const closingMessage = isActive 
    ? `Thank you for being a valued member of our community. We look forward to your continued engagement.` 
    : `If you have any questions or concerns, please do not hesitate to reach out to us.`;

  // Load Handlebars template
  const templatePath = path.join(__dirname, '../templates/accountStatus.hbs');
  const templateSource = fs.readFileSync(templatePath, 'utf8');
  const template = Handlebars.compile(templateSource);

  // Generate the HTML from the template
  const htmlTemplate = template({ fullName, statusMessage, closingMessage });

  const mailOptions = {
    from: process.env.EMAIL_USER, // Use the email from environment variables
    to: email,
    subject: `Your account has been ${isActive ? 'activated' : 'deactivated'}`,
    html: htmlTemplate // Use the generated HTML template
  };

  try {
    await transporter.sendMail(mailOptions); // Sending the email
    return res.status(200).json({ message: `Email sent: Your account has been ${isActive ? 'activated' : 'deactivated'}.` });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Error sending email' });
  }
};

module.exports = {
  sendAccountStatusEmail,
};
