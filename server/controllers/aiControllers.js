const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Gemini AI instance
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to analyze feedback comments
const analyzeFeedback = async (req, res) => {
    try {
        // Fetch comments from the Feedback node in Firebase
        const feedbackRef = admin.database().ref("Feedback"); // Adjust this to your actual node path
        const snapshot = await feedbackRef.once("value");
        const feedbackComments = snapshot.val();

        // Convert feedback object to an array
        const commentsArray = Object.values(feedbackComments || {});

        // Check if comments exist
        if (commentsArray.length === 0) {
            return res.status(404).json({ error: "No feedback comments available." });
        }

        // Create a structured prompt with all comments
        const commentsList = commentsArray.map(commentObj => commentObj.comment).join("\n");
        const prompt = `Here are the comments from users:\n${commentsList}\n\nAnalyze these comments as a whole and determine the underlying issues reported by users. Determine the main problem and define the summary. Construct the sentence by starting Summary: followed by the explanation. Dont add other header.`;

        // Analyze the combined comments using Gemini AI
        const result = await model.generateContent(prompt);

        return res.json({ analysis: result.response.text() }); // Return the analysis
    } catch (error) {
        console.error("Error fetching analysis:", error);
        return res.status(500).json({ error: "Error fetching analysis." });
    }
};

module.exports = { analyzeFeedback };
