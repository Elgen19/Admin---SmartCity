// server/index.js
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




app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://admin-smart-city.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});



app.options('*', cors()); // Preflight support for all routes



app.use(bodyParser.json());
// Routes

app.use('/api/invites', inviteRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/tone", cors(), analyzeFeedbackBasedOnTone);
app.use("/api/type", analyzeFeedbackBasedOnType);
app.use("/api/sender", sendContentToAudienceRoutes);
app.use("/api/notify", notifyRoutes);






app.use('/api', signupRoutes);

app.use('/api/rating', ratingRoutes);
app.use('/api/status', sendAccountStatusEmail);




app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.get("/", (req, res) => res.send("Express on Vercel"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


module.exports = app;
