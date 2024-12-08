import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/images/Rectangle 18.png";
import emailIcon from "../assets/images/Email.png";
import secureIcon from "../assets/images/Secure.png";
import adminImage from "../assets/images/Smart city (1) 2.png";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [modalMessage, setModalMessage] = useState(""); // State for modal message
  const navigate = useNavigate();

  // Firebase Realtime Database instance
  const db = getDatabase();

  // Modal Component
  const AlertDialog = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-600">Security Alert</h2>
        <p className="text-gray-700">{message}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
        >
          Close
        </button>
      </div>
    </div>
  );

  // const checkAdminApproval = async (uid) => {
  //   const adminRef = ref(db, `admins/${uid}`);
  //   const snapshot = await get(adminRef);
  //   if (snapshot.exists()) {
  //     const adminData = snapshot.val();
  //     return adminData.isApproved === true; // Check if admin is approved
  //   } else {
  //     return false; // If admin data doesn't exist or isApproved is false
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 1. Check if the email is verified
      if (!user.emailVerified) {
        await sendEmailVerification(user);
        setModalMessage(
          "Your email is not verified. A verification link has been sent to your email address."
        );
        setShowModal(true); // Show modal with verification message
        auth.signOut();
        return;
      }

      // 2. Check if the admin is approved
      // const isAdminApproved = await checkAdminApproval(user.uid);
      // if (!isAdminApproved) {
      //   setModalMessage(
      //     "Your admin request is still pending approval. Please contact the admin."
      //   );
      //   setShowModal(true); // Show modal with approval message
      //   auth.signOut();
      //   return;
      // }

      // 3. If both email is verified and admin is approved, navigate to profile
      navigate("/home");
    } catch (err) {
      setModalMessage(err.message); // Show modal with error message (like authentication failed)
      setShowModal(true);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="flex h-screen relative">
      {/* Left Side: Background Image */}
      <div className="w-3/5 relative">
        <img
          className="absolute inset-0 object-cover w-full h-full"
          alt="background"
          src={backgroundImage}
        />
      </div>

      {/* Right Side: Form and Content */}
      <div className="w-2/5 flex flex-col items-center justify-center px-8 bg-gradient-to-b from-[#0e1550] to-[#2030b6]">
        <img className="w-48 h-48 mb-6" alt="admin logo" src={adminImage} />
        <h1 className="text-5xl font-bold text-white mb-10 font-nunito tracking-wide">
          Sign In
        </h1>
        <div className="w-full max-w-md bg-white text-gray-800 shadow-lg rounded-2xl p-10 space-y-6">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center border-2 border-gray-400 rounded-md mb-4 transition-transform duration-300 hover:scale-105">
              <img
                className="w-8 h-8 mr-4 p-2"
                alt="email icon"
                src={emailIcon}
              />
              <input
                className="flex-1 bg-transparent outline-none placeholder-gray-400 text-gray-800 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center border-2 border-gray-300 rounded-md mb-6 transition-transform duration-300 hover:scale-105">
              <img
                className="w-8 h-8 mr-4 p-2"
                alt="secure icon"
                src={secureIcon}
              />
              <input
                className="flex-1 bg-transparent outline-none placeholder-gray-400 text-gray-800 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end items-center text-sm mb-6">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-blue-500 hover:underline font-nunito bg-transparent"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-darkturquoise text-white rounded-2xl flex items-center justify-center transition-all duration-300 hover:bg-darkturquoise-light active:scale-95"
            >
              Sign In
            </button>
          </form>
        </div>
        <div className="text-gray-300 text-center mt-8 text-sm font-nunito">
          This page is accessible only to authorized personnel.
        </div>
      </div>

      {/* Show Modal if an error or message is triggered */}
      {showModal && (
        <AlertDialog
          message={modalMessage}
          onClose={() => setShowModal(false)} // Close the modal when clicked
        />
      )}
    </div>
  );
};

export default SignIn;
