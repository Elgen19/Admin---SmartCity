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

const Notification = () => {
  const [activeLink, setActiveLink] = useState("/notification");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();
  const navLinks = [
    { link: "/home", icon: home, label: "Home" },
    { link: "/profile", icon: profile, label: "Admin Profile" },
    { link: "/user-management", icon: users, label: "User Management" },
    { link: "/feedbacks", icon: feedback, label: "Feedbacks" },
    { link: "/contents", icon: content, label: "Contents" },
  ];

  useEffect(() => {
    const auth = getAuth();

    // Check authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        navigate("/"); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [navigate]);

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


      <div className="flex-1 flex flex-col items-center justify-center p-10">
        <h1 className="text-[#09d1e3] text-4xl font-extrabold mb-6">
          Welcome to Notification
        </h1>
    </div>

    </div>
  );
};

export default Notification;
