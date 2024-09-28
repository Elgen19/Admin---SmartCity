import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Invite() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(''); // State for status message
  const [statusType, setStatusType] = useState(''); // State for status type (success or error)
  const [authLoading, setAuthLoading] = useState(true); // State to track auth loading
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userToken = await user.getIdToken();
        setToken(userToken);
      } else {
        // User is not signed in; redirect to home
        navigate('/');
      }
      setAuthLoading(false); // Set auth loading to false after checking
    });

    return () => unsubscribe();
  }, [navigate]);

  const sendInvite = async () => {
    if (!token) {
      setStatusMessage('You need to be logged in to send an invite.');
      setStatusType('error'); // Set status type to error
      return;
    }

    setLoading(true);
    setStatusMessage(''); // Clear previous status message
    setStatusType(''); // Clear previous status type
    try {
      const response = await axios.post(
        'http://localhost:5000/api/invites/send-invite',
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatusMessage(response.data.message); // Set success message
      setStatusType('success'); // Set status type to success
      setEmail(''); // Clear the email input after sending
    } catch (error) {
      console.error('Error sending invitation:', error);
      setStatusMessage('Error sending invitation. Please try again.'); // Set error message
      setStatusType('error'); // Set status type to error
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/'); // Redirect to home or a suitable route
  };

  // Show a loading spinner or message while checking auth state
  if (authLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div 
      className="flex justify-center items-center h-screen bg-cover bg-center" 
      style={{ 
        backgroundImage: `url('http://localhost:3000/static/media/Rectangle%2018.1598e9d2ad9c39c2cb6f.png')`, 
        height: '100vh', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        opacity: 0.9
      }}
    >
      <div className="bg-white shadow-md rounded-lg p-8 w-96 flex flex-col items-center font-nunito relative z-10">
        <h3 className="text-xl font-semibold mb-4">Invite New Admin</h3>
        <p className="text-gray-600 mb-4">Please enter the email address of the admin you want to invite.</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
          className="border border-gray-300 rounded-md p-3 mb-4 w-full text-lg"
        />
        <button 
          onClick={sendInvite} 
          className={`bg-blue-500 text-white rounded-md py-3 px-6 w-full text-lg transition duration-200 ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
          }`} 
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Invitation'}
        </button>
        <button 
          onClick={handleCancel} 
          className="bg-red-500 text-white rounded-md py-3 px-6 w-full mt-4 text-lg hover:bg-red-600"
        >
          Cancel
        </button>
        {/* Status Message */}
        {statusMessage && (
          <p className={`mt-4 text-center text-lg ${statusType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {statusMessage}
          </p>
        )}
      </div>
      <div className="absolute inset-0 bg-black opacity-30 z-0"></div>
    </div>
  );
}

export default Invite;
