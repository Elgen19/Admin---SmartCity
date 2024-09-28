import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminImage from '../assets/images/Smart city (1) 2.png';
import users from '../assets/images/Users.png';
import profile from '../assets/images/profile.png';
import feedback from '../assets/images/feedback.png';
import content from '../assets/images/content.png';
import home from '../assets/images/home.png';

const Home = () => {
  const [activeLink, setActiveLink] = useState('/home'); // Set default active link to Home
  const navigate = useNavigate();

  // Navigation links for the sidebar
  const navLinks = [
    { link: '/home', icon: home, label: 'Home' },
    { link: '/admin-profile', icon: profile, label: 'Admin Profile' },
    { link: '/user-management', icon: users, label: 'User Management' },
    { link: '/feedbacks', icon: feedback, label: 'Feedbacks' },
    { link: '/contents', icon: content, label: 'Contents' },
  ];

  // Handle logout function
  const handleLogout = () => {
    // Logic for logout goes here, e.g., clearing auth state, navigating to login
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-white font-nunito">
      {/* Sidebar */}
      <div className="w-1/4 bg-gradient-to-b from-[#0e1550] to-[#1f2fb6] p-6 flex flex-col">
        {/* Company Logo */}
        <img className="w-[200px] h-[200px] mx-auto mb-10" src={adminImage} alt="Company Logo" />
        <nav className="space-y-6">
          {navLinks.map(({ link, icon, label }) => (
            <a
              key={link}
              href={link}
              onClick={() => setActiveLink(link)}
              className={`flex items-center text-white text-xl hover:text-[#09d1e3] transition ${
                activeLink === link ? 'font-bold border-l-4 border-[#09d1e3] pl-3' : ''
              }`}
              style={{ textDecoration: 'none' }}
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

      {/* Main Content Area - Empty for now */}
      <div className="flex-1 flex flex-col items-center justify-center p-10">
        {/* This area is intentionally left blank for you to build the Home page */}
        <h1 className="text-3xl font-bold text-gray-700">Welcome to the Home Page</h1>
        <p className="text-lg text-gray-500 mt-4">
          This is the main content area where you can build out your home page content.
        </p>
      </div>
    </div>
  );
};

export default Home;
