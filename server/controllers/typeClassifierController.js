const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Gemini AI instance
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to analyze feedback comments based on type
const analyzeFeedbackBasedOnType = async (req, res) => {
    const { type } = req.body; // Get the type from the request body

    try {
        // Fetch comments from the Feedback node in Firebase
        const feedbackRef = admin.database().ref("Feedback");
        const snapshot = await feedbackRef.once("value");
        const feedbackComments = snapshot.val();

        const commentsArray = Object.values(feedbackComments || {});

        // Filter comments based on the specified type
        const filteredComments = commentsArray.filter(commentObj => commentObj.type === type);

        if (filteredComments.length === 0) {
            return res.status(404).json({ error: `No feedback comments available for type: ${type}.` });
        }

        const commentsList = filteredComments.map(commentObj => commentObj.comment).join("\n");
        const prompt = `Here are the ${type} comments from users:\n${commentsList}\n\nPlease summarize these comments as a whole, identifying the main issues reported by users. Format your response by starting with "Summary:" followed by the explanation. Do not include any other header.`;

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

module.exports = { analyzeFeedbackBasedOnType };
