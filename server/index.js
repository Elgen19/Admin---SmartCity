const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const inviteRoutes = require('./routes/inviteRoutes');
const signupRoutes = require('./routes/signUpRoutes');
const authRoutes  = require('./routes/authRoutes');
const aiRoutes = require("./routes/aiRoutes");
const ratingRoutes = require("./routes/ratingRoute");
const toneRoutes = require('./routes/toneClassiferRoute')
const typeRoutes = require('./routes/typeRoutes')
const sendContentToAudienceRoutes = require('./routes/sendRoutes');
const notifyRoutes = require('./routes/notifyRoutes');
const statusRoutes = require('./routes/statusRoutes');
const issueAndSuggestionRoutes = require('./routes/issueAndSuggestionClassifierRoutes');


const app = express();

// CORS configuration
// const allowedOrigins = ['https://admin-smart-city.vercel.app']; // Allow your frontend's URL
const allowedOrigins = ['http://localhost:3000']; // Allow your frontend's URL

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,  // Allow cookies and credentials
}));

// Body parser middleware
app.use(bodyParser.json());

// Routes
app.use('/api/invites', inviteRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/tone", toneRoutes);
app.use("/api/type", typeRoutes);
app.use("/api/sender", sendContentToAudienceRoutes);
app.use("/api/notify", notifyRoutes);
app.use('/api', signupRoutes);
app.use('/api/rating', ratingRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/issue', issueAndSuggestionRoutes);

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
