const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Gemini AI instance
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to analyze feedback comments based on tone
const analyzeFeedbackBasedOnTone = async (req, res) => {
    const { tone } = req.body;

    try {
        // Fetch comments from the Feedback node in Firebase
        const feedbackRef = admin.database().ref("Feedback");
        const snapshot = await feedbackRef.once("value");
        const feedbackComments = snapshot.val();

        // Safeguard: Check if the Feedback node exists or contains data
        if (!feedbackComments) {
            return res.status(404).json({ error: "No feedback comments available. The Feedback node is empty or does not exist." });
        }

        const commentsArray = Object.values(feedbackComments || {});

        // Filter comments based on the specified tone
        const filteredComments = commentsArray.filter(commentObj => commentObj.tone === tone);

        // Safeguard: Check if there are any comments matching the specified tone
        if (filteredComments.length === 0) {
            return res.status(404).json({ error: `No feedback comments available for tone: ${tone}.` });
        }

        const commentsList = filteredComments.map(commentObj => commentObj.comment).join("\n");
        const prompt = `Here are the ${tone} comments from users:\n${commentsList}\n\nPlease summarize these comments as a whole, identifying the main issues reported by users. Format your response by starting with "Summary:" followed by the explanation. Do not include any other header.`;

        const result = await model.generateContent(prompt);

        // Clean the response text by removing any ** or ## characters
        let cleanedAnalysis = result.response.text().replace(/\*\*|##/g, "");

        // Remove the "Summary:" prefix if it exists
        cleanedAnalysis = cleanedAnalysis.replace(/^Summary:\s*/i, "");

        return res.json({ analysis: cleanedAnalysis });
    } catch (error) {
        console.error("Error fetching analysis:", error);
        return res.status(500).json({ error: "Error fetching analysis." });
    }
};

module.exports = { analyzeFeedbackBasedOnTone };
