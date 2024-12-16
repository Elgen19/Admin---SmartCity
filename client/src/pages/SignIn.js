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
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const navigate = useNavigate();

  const db = getDatabase();

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

  const checkAdminApproval = async (uid) => {
    const adminRef = ref(db, `admins/${uid}`);
    const snapshot = await get(adminRef);
    if (snapshot.exists()) {
      const adminData = snapshot.val();
      return adminData.isApproved === true;
    } else {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (!user.emailVerified) {
        await sendEmailVerification(user);
        setModalMessage(
          "Your email is not verified. A verification link has been sent to your email address."
        );
        setShowModal(true);
        auth.signOut();
        return;
      }

      const isAdminApproved = await checkAdminApproval(user.uid);
      if (!isAdminApproved) {
        setModalMessage(
          "Your admin request is still pending approval. Please contact the admin."
        );
        setShowModal(true);
        auth.signOut();
        return;
      }

      navigate("/home");
    } catch (err) {
      setModalMessage(err.message);
      setShowModal(true);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="h-screen">
      {/* Desktop Layout */}
      <div className="hidden md:flex h-full">
        <div className="w-3/5 relative">
          <img
            className="absolute inset-0 object-cover w-full h-full"
            alt="background"
            src={backgroundImage}
          />
        </div>
        <div className="w-2/5 flex flex-col items-center justify-center px-8 bg-gradient-to-b from-[#0e1550] to-[#2030b6]">
          <img className="w-48 h-48 mb-6" alt="admin logo" src={adminImage} />
          <h1 className="text-5xl font-bold text-white mb-10 font-nunito tracking-wide">
            Sign In
          </h1>
          <div className="w-full max-w-md bg-white text-gray-800 shadow-lg rounded-2xl p-10 space-y-6 flex flex-col">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center border border-gray-400 rounded-lg mb-4 transition duration-200 focus-within:border-darkturquoise focus-within:shadow-md">
                <img
                  className="w-8 h-8 mr-4 p-2"
                  alt="email icon"
                  src={emailIcon}
                />
                <input
                  className="flex-1 bg-transparent outline-none placeholder-gray-400 text-gray-800 p-3 transition-transform duration-200 focus:scale-105"
                  placeholder="Enter email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center border border-gray-300 rounded-lg mb-2 transition duration-200 focus-within:border-darkturquoise focus-within:shadow-md">
                <img
                  className="w-8 h-8 mr-4 p-2"
                  alt="secure icon"
                  src={secureIcon}
                />
                <input
                  className="flex-1 bg-transparent outline-none placeholder-gray-400 text-gray-800 p-3 transition-transform duration-200 focus:scale-105"
                  placeholder="Enter password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {/* Forgot Password Link */}
              <div className="text-right mb-6">
                <a
                  href="/forgot-password"
                  className="text-sm text-darkturquoise font-nunito no-underline hover:underline transition duration-200"
                >
                  Forgot Password?
                </a>
              </div>
              <button
                type="submit"
                className="w-full h-12 bg-darkturquoise text-white rounded-2xl transition duration-200 transform hover:scale-105 hover:bg-[#018c96]"
              >
                Sign In
              </button>
            </form>
            {/* Footer Section */}
            <div className="text-gray-500 text-center text-sm font-nunito mt-4">
              This page is accessible only to authorized personnel.
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-full bg-gradient-to-b from-[#0e1550] to-[#2030b6] text-white font-nunito animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center h-1/3 px-6 space-y-4">
          <img
            className="w-40 h-40 animate-scale-up"
            alt="admin logo"
            src={adminImage}
          />
          <h1 className="text-3xl font-bold animate-fade-in">Sign In</h1>
        </div>

        {/* Form Section */}
        <div className="bg-white text-gray-800 shadow-lg rounded-xl p-6 mx-6 mt-8 space-y-6 transform transition-all duration-500 translate-y-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="flex items-center border-2 border-gray-400 rounded-md transition-all duration-300 hover:border-[#09d1e3] focus-within:border-[#09d1e3]">
              <img
                className="w-8 h-8 mr-4 p-2"
                alt="email icon"
                src={emailIcon}
              />
              <input
                className="flex-1 bg-transparent outline-none placeholder-gray-400 text-gray-800 p-3"
                placeholder="Enter email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
            <div className="flex items-center border-2 border-gray-300 rounded-md transition-all duration-300 hover:border-[#09d1e3] focus-within:border-[#09d1e3]">
              <img
                className="w-8 h-8 mr-4 p-2"
                alt="secure icon"
                src={secureIcon}
              />
              <input
                className="flex-1 bg-transparent outline-none placeholder-gray-400 text-gray-800 p-3"
                placeholder="Enter password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <a
                href="/forgot-password"
                className="text-sm text-[#09d1e3] no-underline hover:text-[#08b8c8] transition"
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#09d1e3] text-white rounded-md hover:bg-[#08b8c8] transition transform hover:scale-105"
            >
              Sign In
            </button>
          </form>
        </div>

        {/* Footer Section */}
        <div className="mt-auto text-gray-300 text-center mb-6 text-sm font-nunito px-6">
          This page is accessible only to authorized personnel.
        </div>
      </div>

      {showModal && (
        <AlertDialog
          message={modalMessage}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default SignIn;
