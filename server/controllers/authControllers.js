const admin = require('firebase-admin');

// Controller to check if a user exists by email
exports.checkUserExistence = async (req, res) => {
    const { email } = req.body;
    
    console.log('Received request to check user existence:', email); // Debug log for incoming request

    try {
        // Check if the user exists in Firebase Authentication
        const userRecord = await admin.auth().getUserByEmail(email);
        console.log('User found:', userRecord.email); // Debug log for found user

        res.status(200).json({ exists: true, uid: userRecord.uid });
    } catch (error) {
        console.error('Error while checking user existence:', error); // Debug log for errors

        if (error.code === 'auth/user-not-found') {
            console.log('User not found with email:', email); // Debug log for non-existent user
            res.status(404).json({ exists: false, message: 'No account is registered with this email.' });
        } else {
            res.status(500).json({ error: 'Error checking user existence' });
        }
    }
};
