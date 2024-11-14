// server/config/firebase.js
const admin = require('firebase-admin');
require('dotenv').config(); // Ensure this is at the top

// Log the project_id to confirm it's loaded correctly
console.log('Firebase project ID:', process.env.project_id);

const serviceAccount = {
  type: process.env.type,
  project_id: process.env.project_id,
  private_key_id: process.env.private_key_id,
  private_key: process.env.private_key ? process.env.private_key.replace(/\\n/g, '\n') : null, // Ensure correct format
  client_email: process.env.client_email,
  client_id: process.env.client_id,
  auth_uri: process.env.auth_uri,
  token_uri: process.env.token_uri,
  auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
  client_x509_cert_url: process.env.client_x509_cert_url,
  universe_domain: process.env.universe_domain,
};

// Check if project_id and other essential fields are not undefined or empty
if (!serviceAccount.project_id || !serviceAccount.private_key) {
  console.error('Missing environment variables for Firebase Admin SDK.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://smartcity-6d63f-default-rtdb.firebaseio.com/',
});

module.exports = admin;
