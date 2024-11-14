const firebaseAdmin = require('firebase-admin');

const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Assuming Bearer token

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
        req.user = { id: decodedToken.uid }; // Set user id
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = authenticate; // Export the middleware
