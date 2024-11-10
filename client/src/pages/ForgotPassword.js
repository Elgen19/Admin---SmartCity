import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase"; // Adjust the path as per your setup
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Make sure it's inside the component
import Lottie from 'lottie-react';
import animationData from "../assets/lottifies/city.json"; // Your animation JSON file

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Ensure useNavigate is called directly within the component
  
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      // Check if the user exists in Firebase Auth
      const response = await axios.post(
        "http://localhost:5000/api/auth/check-user",
        { email }
      );

      if (response.data.exists) {
        // If user exists, send the reset password email
        await sendPasswordResetEmail(auth, email);
        setMessage(
          "A password reset link has been sent to your email address."
        );

        // Delay before navigating to allow the message to show
        setTimeout(() => {
          navigate("/"); // Redirect to the sign-in page
        }, 2000); // Adjust delay as needed
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to send password reset email. Please check the email address and try again."
      );
    }
  };

  return (
    <div className="relative flex h-screen items-center justify-center font-nunito">
      {/* Lottie Animation in the background */}
      <div className="absolute inset-0 z-0">
        <Lottie animationData={animationData} loop={true} autoplay={true} height="100%" width="100%" />
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg opacity-90 backdrop-blur-md z-10">
        <h2 className="text-3xl font-semibold mb-6 text-center text-[#09d1e3]">
          Forgot Password
        </h2>
        <form onSubmit={handlePasswordReset}>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-semibold mb-2"
              htmlFor="email"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="w-full max-w-full pt-3 pb-3 mr-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {message && <p className="text-green-500 text-sm">{message}</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg mt-6 hover:bg-blue-700 transition-all duration-200"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
