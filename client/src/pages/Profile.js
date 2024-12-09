import React, { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get, update } from "firebase/database"; // Import update method for updating records
import { useNavigate } from "react-router-dom";
import adminImage from "../assets/images/Smart city (1) 2.png";
import users from "../assets/images/Users.png";
import profile from "../assets/images/profile.png";
import feedback from "../assets/images/feedback.png";
import content from "../assets/images/content.png";
import home from "../assets/images/home.png";
import photo from "../assets/images/male.png";
import activeProfile from "../assets/images/active_profile.png";
import task from "../assets/images/task_inactive.png";


const Profile = () => {
  const [activeLink, setActiveLink] = useState("/profile");
  const [updateMessage, setUpdateMessage] = useState(""); // State to hold the success or error message
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAccessMessage, setShowAccessMessage] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  }); // State to store admin data
  const navigate = useNavigate();
  const navLinks = [
    { link: "/home", icon: home, label: "Home" },
    { link: "/profile", icon: profile, label: "Admin Profile" },
    { link: "/user-management", icon: users, label: "User Management" },
    { link: "/feedback-management", icon: feedback, label: "Feedbacks" },
    { link: "/content-management", icon: content, label: "Contents" },
    //{ link: "/task-management", icon: task, label: "Task Management" },

  ];

  useEffect(() => {
    const auth = getAuth();

    // Check authentication state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        await checkUserAccess(user.uid); // Check user access
        fetchAdminData(user.uid); // Fetch admin data using the authenticated user's UID
      } else {
        setIsAuthenticated(false);
        navigate("/"); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [navigate]);

  const checkUserAccess = async (uid) => {
    const db = getDatabase();
    const userRef = ref(db, `admins/${uid}`); // Fetch the user's data based on uid

    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const access = userData.access || ""; // Get access property
        setHasAccess(access.includes("ADMIN_PROFILE")); // Check for ADMIN_PROFILE access
        if (!access.includes("ADMIN_PROFILE")) {
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

  // Fetch admin data from Firebase Realtime Database
  const fetchAdminData = async (uid) => {
    const db = getDatabase();
    const adminRef = ref(db, `admins/${uid}`); // Reference to the admin's data based on their UID
    try {
      const snapshot = await get(adminRef);
      if (snapshot.exists()) {
        setAdminData(snapshot.val()); // Set admin data to state
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  // Handle logout function
  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Handle input change for name and phone number
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdminData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle update button click
  const handleUpdate = async () => {
    const { name, phoneNumber } = adminData;

    // Validate inputs
    if (!name.trim() || !phoneNumber.trim()) {
      alert("Name and Phone Number cannot be empty.");
      return;
    }

    // Update the admin's record in Firebase
    const db = getDatabase();
    const adminRef = ref(db, `admins/${getAuth().currentUser.uid}`);
    try {
      await update(adminRef, { name, phoneNumber });
      setUpdateMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setUpdateMessage("Failed to update profile. Please try again.");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const handleAccessMessageRedirect = () => {
    setShowAccessMessage(false);
    navigate("/home"); // Redirect to home
  };

  return (
    <div className="flex h-screen bg-white font-nunito">
      {showAccessMessage ? (
        // Show Access Denied message if the user doesn't have access
        <div className="flex items-center justify-center h-screen bg-gray-200">
          <div className="bg-red-100 border border-red-400 text-red-700 p-6 rounded-lg shadow-lg max-w-md w-full">
            <strong className="font-bold text-lg">Access Denied!</strong>
            <p className="block">
              You do not have access to view or edit profile. Contact your SuperAdmin if you need access.
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
        <>
          {/* Sidebar */}
          <div className="w-1/6 bg-gradient-to-b from-[#0e1550] to-[#1f2fb6] p-6 flex flex-col overflow-hidden">
            <img
              className="w-[200px] h-[200px] mx-auto mb-10"
              src={adminImage} // Updated with your image path
              alt="Company Logo"
            />
            <nav className="space-y-6">
              {navLinks.map(({ link, icon, label }) => (
                <a
                  key={link}
                  href={link}
                  onClick={() => setActiveLink(link)}
                  className={`flex items-center text-xl transition ${
                    activeLink === link
                      ? "text-[#09d1e3] font-bold border-l-4 border-[#09d1e3] pl-3" // Active link color
                      : "text-white hover:text-[#09d1e3]"
                  }`}
                  style={{ textDecoration: "none" }}
                >
                  <img
                    className="w-8 h-8 mr-3 transition"
                    src={activeLink === link ? activeProfile : icon} // Use active icon if link is active
                    alt={`${label} Icon`}
                  />
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
  
          {/* Profile Information */}
          <div className="flex-1 flex flex-col items-center justify-center p-10">
            <h1 className="text-[#09d1e3] text-4xl font-extrabold mb-6">
              Admin Profile
            </h1>
            <img
              className="w-[200px] h-[200px] rounded-full mb-6"
              src={photo}
              alt="Admin Profile"
            />
  
            {/* Profile Details */}
            <div className="w-full max-w-md space-y-4">
              {/* Email Address Input */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={adminData.email}
                  disabled
                  className="w-full h-12 border border-gray-300 rounded-lg px-3 text-[#f0f0f0] bg-[#141d70] cursor-not-allowed"
                />
              </div>
  
              {/* Full Name Input */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={adminData.name}
                  onChange={handleChange}
                  className="w-full h-12 border border-gray-300 rounded-lg px-3 text-gray-700 bg-white focus:border-[#09d1e3] focus:outline-none transition"
                />
              </div>
  
              {/* Phone Number Input */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={adminData.phoneNumber}
                  onChange={handleChange}
                  className="w-full h-12 border border-gray-300 rounded-lg px-3 text-gray-700 bg-white focus:border-[#09d1e3] focus:outline-none transition"
                />
              </div>
  
              {/* Update Button */}
              <button
                onClick={handleUpdate}
                className="w-[475px] h-12 bg-[#09d1e3] text-white font-semibold rounded-lg mt-4 hover:bg-[#06b4c5] transition"
              >
                Update
              </button>
  
              {/* Success or Error Message */}
              {updateMessage && (
                <p
                  className={`mt-4 text-center ${
                    updateMessage.includes("successfully")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {updateMessage}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
  
};

export default Profile;
