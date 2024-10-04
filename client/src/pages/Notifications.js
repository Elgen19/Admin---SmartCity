import React, { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get, remove } from "firebase/database";
import { useNavigate } from "react-router-dom";
import adminImage from "../assets/images/Smart city (1) 2.png";
import users from "../assets/images/Users.png";
import profile from "../assets/images/profile.png";
import feedback from "../assets/images/feedback.png";
import content from "../assets/images/content.png";
import home from "../assets/images/home.png";

const Notification = () => {
  const [activeLink, setActiveLink] = useState("/notification");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [hasAccess, setHasAccess] = useState(true);
  const [showAccessMessage, setShowAccessMessage] = useState(false); // State for access message
  const navigate = useNavigate();

  const navLinks = [
    { link: "/home", icon: home, label: "Home" },
    { link: "/profile", icon: profile, label: "Admin Profile" },
    { link: "/user-management", icon: users, label: "User Management" },
    { link: "/feedback-management", icon: feedback, label: "Feedbacks" },
    { link: "/content-management", icon: content, label: "Contents" },
  ];

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        setCurrentUserEmail(user.email);
        await checkUserAccess(user.uid); // Check user access
        await fetchNotifications(user.email); // Fetch notifications
      } else {
        setIsAuthenticated(false);
        navigate("/"); // Redirect to login if not authenticated
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
        setHasAccess(access.includes("NOTIFICATIONS")); // Check for NOTIFICATIONS access
        if (!access.includes("NOTIFICATIONS")) {
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

  const fetchNotifications = async (userEmail) => {
    const db = getDatabase();
    const notificationsRef = ref(db, "AdminNotifications");

    try {
      const snapshot = await get(notificationsRef);
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        const notificationsArray = Object.entries(notificationsData)
          .map(([key, value]) => ({
            id: key,
            ...value,
          }))
          .filter((notification) => notification.senderEmail !== userEmail);

        if (notificationsArray.length > 0) {
          setNotifications(notificationsArray);
        } else {
          setNotifications([]);
        }
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate("/"); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleClearAll = async () => {
    const db = getDatabase();
    const notificationsRef = ref(db, "AdminNotifications");

    try {
      await remove(notificationsRef);
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const handleAccessMessageRedirect = () => {
    setShowAccessMessage(false);
    navigate("/home"); // Redirect to home
  };

  return (
    <div className="flex h-screen bg-white font-nunito">
      {showAccessMessage ? (
        // Show Access Denied message if the user doesn't have access
        <div className="flex items-center justify-center flex-grow bg-gray-200 w-full h-full absolute top-0 left-0">
          <div className="bg-red-100 border border-red-400 text-red-700 p-6 rounded-lg shadow-lg max-w-md w-full">
            <strong className="font-bold text-lg">Access Denied!</strong>
            <p className="block">
              You do not have access to notifications. Contact your SuperAdmin if you wish to get access.
            </p>
            <div className="mt-4">
              <button
                onClick={handleAccessMessageRedirect}
                className="bg-[#09d1e3] text-white px-4 py-2 rounded-lg hover:bg-[#07a8c4] transition"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Show the main content if the user has access
        <>
          <div className="w-1/4 bg-gradient-to-b from-[#0e1550] to-[#1f2fb6] p-6 flex flex-col">
            <img
              className="w-[200px] h-[200px] mx-auto mb-10"
              src={adminImage}
              alt="Company Logo"
            />
            <nav className="space-y-6">
              {navLinks.map(({ link, icon, label }) => (
                <a
                  key={link}
                  href={link}
                  onClick={() => setActiveLink(link)}
                  className={`flex items-center text-white text-xl hover:text-[#09d1e3] transition ${
                    activeLink === link
                      ? "font-bold border-l-4 border-[#09d1e3] pl-3"
                      : ""
                  }`}
                  style={{ textDecoration: "none" }}
                >
                  <img className="w-8 h-8 mr-3" src={icon} alt={`${label} Icon`} />
                  {label}
                </a>
              ))}
            </nav>
            <div className="mt-auto">
              <button
                onClick={handleLogout}
                className="w-full h-12 bg-red-600 text-white font-semibold rounded-lg mt-4 hover:bg-red-500 transition"
              >
                Logout
              </button>
            </div>
          </div>
  
          <div className="flex-1 flex flex-col p-10">
            <div className="flex justify-between items-center w-full mb-6">
              <h1 className="text-[#09d1e3] text-4xl font-extrabold">
                Notifications
              </h1>
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-400 transition"
                >
                  Clear All
                </button>
              )}
            </div>
  
            <div className="w-full flex-grow">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="bg-[#f3f4f6] p-6 rounded-lg shadow-lg mb-6 flex flex-col"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {notification.title}
                      </h2>
                      <p className="text-gray-700">{notification.message}</p>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="material-icons text-gray-500">schedule</span>
                      <span className="text-gray-500">
                        {new Date(notification.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center mx-auto text-xl font-semibold">
                  No notifications found.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
  
};

export default Notification;
