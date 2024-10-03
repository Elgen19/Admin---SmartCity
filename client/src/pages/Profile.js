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

const Profile = () => {
  const [activeLink, setActiveLink] = useState("/admin-profile");
  const [updateMessage, setUpdateMessage] = useState(""); // State to hold the success or error message
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
    { link: "/feedbacks", icon: feedback, label: "Feedbacks" },
    { link: "/content-management", icon: content, label: "Contents" },
  ];

  useEffect(() => {
    const auth = getAuth();

    // Check authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        fetchAdminData(user.uid); // Fetch admin data using the authenticated user's UID
      } else {
        setIsAuthenticated(false);
        navigate("/"); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [navigate]);

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

  return (
    <div className="flex h-screen bg-white font-nunito">
      {/* Sidebar */}
      <div className="w-1/4 bg-gradient-to-b from-[#0e1550] to-[#1f2fb6] p-6 flex flex-col">
        {/* Company Logo */}
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
        {/* Logout Button */}
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
    </div>
  );
};

export default Profile;
