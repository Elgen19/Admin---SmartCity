const admin = require('firebase-admin');
const transporter = require('../config/mailConfig');



const db = admin.database();

// Controller function to handle sending content
const sendContentToAudience = async (req, res) => {
  const { title, message, audience, channel } = req.body;

  // Function to fetch emails from Firebase based on node path
  const fetchEmails = async (nodePath) => {
    const emails = [];
    try {
      const snapshot = await db.ref(nodePath).once('value');
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Iterate through users/admins and extract their emails
        for (const id in data) {
          if (data[id].email) {
            emails.push(data[id].email);
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching emails from ${nodePath}:`, error);
    }
    return emails;
  };

  try {
    let emailRecipients = [];

    // Fetch emails based on the audience type
    if (audience === 'admins') {
      emailRecipients = await fetchEmails('admins');
    } else if (audience === 'users') {
      emailRecipients = await fetchEmails('Users');
    } else if (audience === 'both') {
      const adminEmails = await fetchEmails('admins');
      const userEmails = await fetchEmails('Users');
      emailRecipients = [...adminEmails, ...userEmails];
    }

    // If no emails were found, return an error
    if (emailRecipients.length === 0) {
      return res.status(404).json({ message: 'No email recipients found.' });
    }

    // If the selected channel is email, send the email
    if (channel === 'email') {
      // Email options
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emailRecipients.join(','),
        subject: `New Announcement: ${title}`,
        text: message,
      };

      // Send email using the transporter
      await transporter.sendMail(mailOptions);

      // Respond with success message
      return res.status(200).json({ message: 'Content sent successfully!' });
    } else {
      return res.status(400).json({ message: 'Invalid channel selected.' });
    }
  } catch (error) {
    console.error('Error sending content:', error);
    return res.status(500).json({ message: 'Error sending content' });
  }
};

module.exports = {
  sendContentToAudience,
};
