import { useState, useEffect } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get, set } from "firebase/database";
import { useNavigate } from "react-router-dom";

function Invite() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(""); // State for status message
  const [statusType, setStatusType] = useState(""); // State for status type (success or error)
  const [authLoading, setAuthLoading] = useState(true); // State to track auth loading
  const [showAccessMessage, setShowAccessMessage] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userToken = await user.getIdToken();
        await checkUserAccess(user.uid); // Check user access
        setToken(userToken);
      } else {
        // User is not signed in; redirect to home
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const checkUserAccess = async (uid) => {
    const db = getDatabase();
    const userRef = ref(db, `admins/${uid}`); // Fetch the user's data based on uid

    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const access = userData.access || ""; // Get access property
        setHasAccess(access.includes("INVITE_NEW_ADMIN")); // Check for INVITE_NEW_ADMIN access
        if (!access.includes("INVITE_NEW_ADMIN")) {
          setShowAccessMessage(true); // Show access message
        }
      } else {
        navigate("/"); // Redirect if user data not found
      }
    } catch (error) {
      console.error("Error fetching user access:", error);
      navigate("/"); // Redirect on error
    }
  };

  const sendInvite = async () => {
    if (!token) {
      setStatusMessage("You need to be logged in to send an invite.");
      setStatusType("error"); // Set status type to error
      return;
    }

    setLoading(true);
    setStatusMessage(""); // Clear previous status message
    setStatusType(""); // Clear previous status type
    try {
      const response = await axios.post(
        "http://localhost:5000/api/invites/send-invite",
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

        // Log the admin activity after sending the invite
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          await logAdminActivity(user.uid, `Sent invite for new admin to ${email}`, "Invite Admin Page");
        }

      setStatusMessage(response.data.message); // Set success message
      setStatusType("success"); // Set status type to success
      setEmail(""); // Clear the email input after sending
    } catch (error) {
      console.error("Error sending invitation:", error);
      setStatusMessage("Error sending invitation. Please try again."); // Set error message
      setStatusType("error"); // Set status type to error
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/user-management"); // Redirect to home or a suitable route
  };

  const handleAccessMessageRedirect = () => {
    setShowAccessMessage(false);
    navigate("/home"); // Redirect to home
  };

  const logAdminActivity = async (adminId, action, page) => {
    const db = getDatabase();
    const logRef = ref(db, `ActivityLogs/${adminId}/${new Date().getTime()}`); // Unique key using timestamp under adminId

    try {
        await set(logRef, {
            action: action,
            page: page,
            timestamp: new Date().toISOString(), // Optional if you want to store a separate timestamp
        });
        console.log("Activity logged successfully");
    } catch (error) {
        console.error("Error logging admin activity:", error);
    }
};


  return (
    <>
      {showAccessMessage ? (
        // Show Access Denied message if the user doesn't have access
        <div className="flex items-center justify-center h-screen bg-gray-200">
          <div className="bg-red-100 border border-red-400 text-red-700 p-6 rounded-lg shadow-lg max-w-md w-full">
            <strong className="font-bold text-lg">Access Denied!</strong>
            <p className="block">
              You do not have access to invite new admins. Contact your SuperAdmin if you need access.
            </p>
            <div className="mt-4">
              <button
                onClick={handleAccessMessageRedirect}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Show the Invite Admin form if the user has access
        <div
          className="flex justify-center items-center h-screen bg-cover bg-center"
          style={{
            backgroundImage: `url('http://localhost:3000/static/media/Rectangle%2018.1598e9d2ad9c39c2cb6f.png')`,
            height: "100vh",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.9,
          }}
        >
          <div className="bg-white shadow-md rounded-lg p-8 w-96 flex flex-col items-center font-nunito relative z-10">
            <h3 className="text-xl font-semibold mb-4">Invite New Admin</h3>
            <p className="text-gray-600 mb-4">
              Please enter the email address of the admin you want to invite.
            </p>
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
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
              }`}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Invitation"}
            </button>
            <button
              onClick={handleCancel}
              className="bg-red-500 text-white rounded-md py-3 px-6 w-full mt-4 text-lg hover:bg-red-600"
            >
              Cancel
            </button>
            {/* Status Message */}
            {statusMessage && (
              <p
                className={`mt-4 text-center text-lg ${
                  statusType === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {statusMessage}
              </p>
            )}
          </div>
          <div className="absolute inset-0 bg-black opacity-30 z-0"></div>
        </div>
      )}
    </>
  );
  
}

export default Invite;
