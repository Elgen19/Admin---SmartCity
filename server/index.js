require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors'); // Import CORS
const bodyParser = require('body-parser');
const inviteRoutes = require('./routes/inviteRoutes');
const signupRoutes = require('./routes/signUpRoutes');
const authRoutes  = require('./routes/authRoutes');
const aiRoutes = require("./routes/aiRoutes");
const ratingRoutes = require("./routes/ratingRoute");
const { analyzeFeedbackBasedOnTone } = require('./controllers/toneClassifierController');
const { analyzeFeedbackBasedOnType } = require('./controllers/typeClassifierController');
const sendContentToAudienceRoutes = require('./routes/sendRoutes');
const notifyRoutes = require('./routes/notifyRoutes');
const { sendAccountStatusEmail } = require('./controllers/statusController');

const app = express();

// CORS configuration
app.use(cors({
  origin: 'https://admin-smart-city.vercel.app',  // Allow your frontend's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));


// Ensure OPTIONS requests are handled correctly (for preflight)
app.options('*', cors());

// Body parser middleware
app.use(bodyParser.json());

// Routes
app.use('/api/invites', inviteRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/tone", analyzeFeedbackBasedOnTone);
app.use("/api/type", analyzeFeedbackBasedOnType);
app.use("/api/sender", sendContentToAudienceRoutes);
app.use("/api/notify", notifyRoutes);
app.use('/api', signupRoutes);
app.use('/api/rating', ratingRoutes);
app.use('/api/status', sendAccountStatusEmail);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Basic route to check if server is running
app.get("/", (req, res) => res.send("Express on Vercel"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
