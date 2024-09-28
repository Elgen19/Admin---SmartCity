import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import emailIcon from '../assets/images/Email.png';
import backgroundImage from '../assets/images/Rectangle 18.png';
import secureIcon from '../assets/images/Secure.png';
import profileIcon from '../assets/images/Customer.png';
import adminImage from '../assets/images/Smart city (1) 2.png';
import Lottie from 'lottie-react';
import loadingAnimation from '../assets/lottifies/loading.json';

function SignUp() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [signUpProcessing, setSignUpProcessing] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('No token provided.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          // `https://smartcity-dn34.onrender.com/api/verify-invite?token=${token}`
          `http://localhost:5000/api/verify-invite?token=${token}`
        );
        setEmail(response.data.email);
        setTokenValid(true);
        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Invalid or expired invitation link.'
        );
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    setSignUpProcessing(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setSignUpProcessing(false);
      return;
    }

    if (fullName.trim() === "") {
      setError("Please input your full name");
      setSignUpProcessing(false);
      return; // Stop the function execution
    }
    

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setSignUpProcessing(false);
      return;
    }

    setTimeout(async () => {
      // try {
      //   await axios.post('https://smartcity-dn34.onrender.com/api/signup', {
      //     token,
      //     name: fullName,
      //     password,
      //   });

        try {
          await axios.post('http://localhost:5000/api/signup', {
            token,
            name: fullName,
            password,
          });

     

        setVerificationSent(true);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Error during sign-up. Please try again.'
        );
      } finally {
        setSignUpProcessing(false);
      }
    }, 2000);
  };

  if (verificationSent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0e1550] to-[#1f2fb6] text-white">
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-2xl font-bold">Please Verify Your Account</h1>
          <p>An email verification link has been sent to {email}.</p>
          <p>Please check your email and verify your account before proceeding.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#09d1e3] hover:bg-[#05b1d1] text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen"
        style={{
          background: 'linear-gradient(to bottom, #0E1550 30%, #2030B6 100%)',
        }}
      >
        <div className="flex flex-col items-center space-y-4">
          <Lottie
            animationData={loadingAnimation}
            loop={true}
            style={{ width: 100, height: 100 }}
          />
          <p className="text-lg font-semibold text-white">
            Please wait while we load your information...
          </p>
        </div>
      </div>
    );
  }

  if (signUpProcessing) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen"
        style={{
          background: 'linear-gradient(to bottom, #0E1550 30%, #2030B6 100%)',
        }}
      >
        <div className="flex flex-col items-center space-y-4">
          <Lottie
            animationData={loadingAnimation}
            loop={true}
            style={{ width: 100, height: 100 }}
          />
          <p className="text-lg font-semibold text-white">
            Processing your registration, please wait...
          </p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-500 to-pink-500 text-white">
        <div className="p-6 bg-white/20 rounded-xl shadow-lg flex flex-col items-center space-y-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-red-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <p className="text-xl font-semibold">Invalid or Expired Token</p>
          <p className="text-center">
            The invitation link you used is either invalid or has expired. Please check your
            invitation email or contact support for assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="AdminSignup w-screen h-screen flex overflow-hidden">
      <img
        className="w-1/2 h-full object-cover"
        src={backgroundImage}
        alt="Background"
      />
      <div className="flex-1 h-full bg-gradient-to-b from-[#0e1550] to-[#1f2fb6] flex justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-6 p-6">
          <div className="flex flex-col items-center">
            <img className="w-36 h-36 mb-2" src={adminImage} alt="Company Logo" />
            <h1 className="text-white text-4xl font-bold font-['Nunito'] tracking-[2px] shadow-lg">
              Sign Up
            </h1>
          </div>

          <div className="flex flex-col justify-start items-center gap-6">
            {/* Input fields with adjusted padding/margin */}
            <div className="w-[380px] p-3 bg-white rounded-2xl shadow-lg border border-black/30 transition-transform duration-300 hover:scale-105">
              <div className="flex items-center gap-2">
                <img className="w-8 h-8" src={profileIcon} alt="Full Name Icon" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  className="text-[#1e1e1e]/70 text-lg font-medium font-['Nunito'] bg-transparent outline-none w-full"
                  required
                />
              </div>
            </div>
            <div className="w-[380px] p-3 bg-white rounded-2xl shadow-lg border border-black/30 transition-transform duration-300 hover:scale-105">
              <div className="flex items-center gap-2">
                <img className="w-8 h-8" src={emailIcon} alt="Email Icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="text-[#1e1e1e]/70 text-lg font-medium font-['Nunito'] bg-transparent outline-none w-full"
                  required
                  readOnly
                />
              </div>
            </div>
            <div className="w-[380px] p-3 bg-white rounded-2xl shadow-lg border border-black/30 transition-transform duration-300 hover:scale-105">
              <div className="flex items-center gap-2">
                <img className="w-8 h-8" src={secureIcon} alt="Password Icon" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="text-[#1e1e1e]/70 text-lg font-medium font-['Nunito'] bg-transparent outline-none w-full"
                  required
                />
              </div>
            </div>
            <div className="w-[380px] p-3 bg-white rounded-2xl shadow-lg border border-black/30 transition-transform duration-300 hover:scale-105">
              <div className="flex items-center gap-2">
                <img className="w-8 h-8" src={secureIcon} alt="Confirm Password Icon" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="text-[#1e1e1e]/70 text-lg font-medium font-['Nunito'] bg-transparent outline-none w-full"
                  required
                />
              </div>
            </div>
            <button
              onClick={handleSignUp}
              className="bg-[#09d1e3] text-lg font-bold text-white rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105"
              style={{
                width: '380px', // Match the input width
                height: '50px', // Adjust the button height
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Error message display */}
          {error && (
            <div className="w-[380px] bg-red-100 text-red-700 p-3 text-center rounded-lg border border-red-300">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SignUp;
