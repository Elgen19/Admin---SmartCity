import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'; // Import signOut
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userToken = await user.getIdToken();
        setToken(userToken);
        console.log('User is authenticated. Token:', userToken); // Log the user token
      } else {
        setToken('');
        console.log('User is not authenticated. Redirecting...'); // Log unauthenticated state
        navigate('/'); // Redirect to login or home page if not authenticated
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const sendInvite = async () => {
    if (!token) {
      alert('You need to be logged in to send an invite.');
      console.log('No token available. Cannot send invite.'); // Log token absence
      return;
    }

    try {
      console.log('Sending invite to:', email); // Log the email being invited
      const response = await axios.post(
        'https://admin-smart-city-jjxbecet9-elgens-projects.vercel.app/api/invites/send-invite',
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Response from server:', response.data); // Log the server response
      alert(response.data.message);
    } catch (error) {
      console.error('Error sending invitation:', error); // Log the error
      alert('Error sending invitation');
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth); // Sign the user out
      console.log('User has logged out. Redirecting to sign-in page.'); // Log logout action
      navigate('/'); // Redirect to the sign-in page
    } catch (error) {
      console.error('Error during logout:', error); // Log any errors during logout
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
      <button onClick={handleLogout} style={{ marginLeft: '10px' }}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
