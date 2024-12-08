// Import the Firebase Admin SDK
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with your service account
admin.initializeApp({
  credential: admin.credential.cert(require('./firebaseServiceAccountKey.json')), // Path to your service account JSON file
  databaseURL: "https://smartcity-6d63f.firebaseio.com"
});

// Get a reference to the Firebase Realtime Database
const db = admin.database();

// Define the data to be pushed
const newAdminData = {
  name: "John Doe",
  phoneNumber: "09123456789",
  email: "thesmartcityprojects@gmail.com",
  invitedBy: "existingAdmin123",
  createdAt: Date.now(),
  isApproved: false,
  role: "Admin",
  access: "FEEDBACK_MANAGEMENT, HOME, CONTENT_MANAGEMENT, NOTIFICATIONS, ADMIN_PROFILE, TASK_MANAGEMENT",
  active: true,
};

// Push data to the 'admins' node
const ref = db.ref('admins'); // Reference to 'admins' node in your database
ref.push(newAdminData, (error) => {
  if (error) {
    console.error("Error pushing data:", error);
  } else {
    console.log("Data successfully pushed!");
  }
});
