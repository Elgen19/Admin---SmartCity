const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Gemini AI instance
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to classify feedback into Issues and Suggestions and generate summaries
const classifyAndSummarizeFeedback = async (req, res) => {
    try {
        console.log("Fetching feedback data from Firebase...");
        // Fetch feedback data from Firebase
        const feedbackRef = admin.database().ref("Feedback");
        const snapshot = await feedbackRef.once("value");
        const feedbackData = snapshot.val();

        // Safeguard: Check if feedback data exists
        if (!feedbackData) {
            console.log("No feedback data available in Firebase.");
            return res.status(404).json({ error: "No feedback data available." });
        }

        const commentsArray = Object.values(feedbackData);
        console.log(`Fetched ${commentsArray.length} feedback comments.`);

        // Safeguard: Ensure there are comments to work with
        if (commentsArray.length === 0) {
            console.log("No feedback comments available after fetching.");
            return res.status(404).json({ error: "No feedback comments available." });
        }

        console.log("Classifying feedback into Issues and Suggestions...");
        // Filter feedbacks that have hasClassified property set to "No"
        const unclassifiedFeedback = commentsArray.filter(commentObj => commentObj.hasClassified === "No");

        console.log(`Found ${unclassifiedFeedback.length} feedbacks with hasClassified set to "No".`);

        // Classify feedback into Issues (Bug Report) and Suggestions (Feature Suggestion)
        const issues = unclassifiedFeedback.filter(commentObj => commentObj.type === "Bug Report");
        const suggestions = unclassifiedFeedback.filter(commentObj => commentObj.type === "Feature Suggestion");

        console.log(`Identified ${issues.length} Issues and ${suggestions.length} Suggestions.`);

        // Helper function to cluster comments using AI
        const clusterComments = async (comments, type) => {
            if (comments.length === 0) {
                console.log(`No comments available to cluster for type: ${type}.`);
                return [];
            }

            console.log(`Clustering ${comments.length} ${type} comments using AI...`);
            // Prepare comments for the AI model
            const commentsList = comments.map(commentObj => commentObj.comment).join("\n");
            const prompt = `Here are ${type} comments from users:\n${commentsList}\n\nPlease cluster similar comments into fewer groups by summarizing their common issues or suggestions. Each group should be a single sentence description.`;

            // Generate clusters using Gemini AI
            const result = await model.generateContent(prompt);

            // Process AI response and split it into clusters
            const clusters = result.response.text().split("\n").filter(line => line.trim() !== "");
            console.log(`Clustered ${clusters.length} groups for ${type}.`);
            return clusters;
        };

        // Cluster issues and suggestions
        const clusteredIssues = await clusterComments(issues, "Issues");
        const clusteredSuggestions = await clusterComments(suggestions, "Suggestions");

        // Fetch existing TaskSummaries to prevent duplicates
        const existingSummaries = await getExistingSummaries();

        console.log("Saving clustered Issues and Suggestions to Firebase...");
        // Save clusters to Firebase under TaskSummaries
        const taskSummariesRef = admin.database().ref("TaskSummaries");

        // Helper function to save summaries to Firebase
        const saveSummaries = async (clusters, type) => {
            const saveTasks = clusters.map(async (cluster) => {
                // Check if this cluster already exists in Firebase
                if (!existingSummaries.includes(cluster)) {
                    const taskSummaryId = taskSummariesRef.push().key; // Generate unique ID
                    console.log(`Saving ${type} summary to Firebase: ${cluster}`);
                    await taskSummariesRef.child(taskSummaryId).set({
                        taskDescription: cluster,
                        type: type
                    });
                }
            });
            await Promise.all(saveTasks);
        };

        // Save Issues and Suggestions
        await saveSummaries(clusteredIssues, "Issues");
        await saveSummaries(clusteredSuggestions, "Suggestions");

       // Now, update the Feedback records to mark them as classified
const feedbackUpdates = {};

// Iterate over each feedback record and mark it as classified
Object.keys(feedbackData).forEach(feedbackId => {
    const commentObj = feedbackData[feedbackId];

    // Check if the feedback has not been classified and if it's either a "Bug Report" or "Feature Suggestion"
    if (commentObj.hasClassified === "No" && (commentObj.type === "Bug Report" || commentObj.type === "Feature Suggestion")) {
        const feedbackPath = `Feedback/${feedbackId}`; // Use the Firebase generated feedbackId
        feedbackUpdates[`${feedbackPath}/hasClassified`] = "Yes"; // Mark it as classified
    }
});

// Update the feedback records in Firebase
if (Object.keys(feedbackUpdates).length > 0) {
    try {
        await admin.database().ref().update(feedbackUpdates);  // Perform the update operation
        console.log("Successfully updated the 'hasClassified' property for processed feedback.");
    } catch (error) {
        console.error("Error updating feedback records:", error);
    }
}


        console.log("Successfully saved all summaries to Firebase and updated classifications.");
        // Respond with success
        return res.json({
            message: "Feedback classified and summarized successfully.",
            issues: clusteredIssues,
            suggestions: clusteredSuggestions
        });
    } catch (error) {
        console.error("Error processing feedback:", error);
        return res.status(500).json({ error: "Error processing feedback." });
    }
};

// Function to fetch existing summaries from Firebase
const getExistingSummaries = async () => {
    const taskSummariesRef = admin.database().ref("TaskSummaries");
    const snapshot = await taskSummariesRef.once("value");
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.values(data).map(task => task.taskDescription); // Return task descriptions
    }
    return [];
};

module.exports = { classifyAndSummarizeFeedback };
