import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Correctly import Firebase functions

function Dashboard() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const auth = getAuth(); // Get the Firebase Auth instance
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userToken = await user.getIdToken();
        setToken(userToken); // Set the user token for authorized requests
      } else {
        setToken(''); // Reset token if user is not logged in
      }
    });

    return () => unsubscribe(); // Cleanup the subscription on unmount
  }, []);

  const sendInvite = async () => {
    if (!token) {
      alert('You need to be logged in to send an invite.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/invites/send-invite',
        { email },
        { headers: { Authorization: `Bearer ${token}` } } // Include token in the headers
      );

      alert(response.data.message);
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Error sending invitation');
    }
  };

  return (
    <div>
      <h3>Invite New Admin</h3>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email"
      />
      <button onClick={sendInvite}>Send Invitation</button>
    </div>
  );
}

export default Dashboard;
