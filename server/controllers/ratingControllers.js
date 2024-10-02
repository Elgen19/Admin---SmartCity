const admin = require("firebase-admin");

// Function to retrieve ratings from Firebase and calculate highest, lowest, and average
const getRatingStats = async (req, res) => {
    try {
        // Fetch all feedbacks from the Feedback node
        const feedbackRef = admin.database().ref("Feedback");
        const snapshot = await feedbackRef.once("value");
        const feedbackData = snapshot.val();

        if (!feedbackData) {
            return res.status(404).json({ error: "No feedback data available." });
        }

        // Convert feedback object to array to access the ratings
        const feedbackArray = Object.values(feedbackData);

        // Extract ratings and ensure only numeric values are considered
        const ratings = feedbackArray.map(feedback => feedback.rating).filter(rating => typeof rating === 'number');

        if (ratings.length === 0) {
            return res.status(404).json({ error: "No ratings available." });
        }

        // Calculate highest, lowest, and average ratings
        const highestRating = Math.max(...ratings);
        const lowestRating = Math.min(...ratings);
        const averageRating = (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(2);
        // Count how many people gave the highest and lowest ratings
        const highestCount = ratings.filter(rating => rating === highestRating).length;
        const lowestCount = ratings.filter(rating => rating === lowestRating).length;

        // Return the calculated stats
        return res.json({
            highestRating,
            lowestRating,
            averageRating,
            highestCount,
            lowestCount,
        });
    } catch (error) {
        console.error("Error fetching ratings:", error);
        return res.status(500).json({ error: "Error fetching rating statistics." });
    }
};

module.exports = { getRatingStats };
