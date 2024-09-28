import React, { useState } from 'react';

const UserManagement = () => {
  // State to keep track of the active link
  const [activeLink, setActiveLink] = useState('/user-management');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex h-screen bg-white font-nunito"> {/* Added font class */}
      {/* Sidebar */}
      <div className="w-1/4 bg-gradient-to-b from-[#0e1550] to-[#1f2fb6] p-6 flex flex-col">
        {/* Company Logo */}
        <img
          className="w-[200px] h-[200px] mx-auto mb-10" // Set logo size and center it
          src="https://via.placeholder.com/200" // Replace with your logo URL
          alt="Company Logo"
        />
        <nav className="space-y-6"> {/* Increased spacing between links */}
          {['/home', '/admin-profile', '/user-management', '/feedbacks', '/contents'].map((link) => (
            <a
              key={link}
              href={link}
              onClick={() => setActiveLink(link)} // Update active link on click
              className={`flex items-center text-white text-xl hover:text-[#09d1e3] transition ${
                activeLink === link ? 'font-bold border-l-4 border-[#09d1e3] pl-3' : ''
              }`} // Indicator for active link
              style={{ textDecoration: 'none' }} // Remove underline
            >
              <img className="w-8 h-8 mr-3" src="https://via.placeholder.com/24" alt={`${link} Icon`} />
              {link === '/home' ? 'Home' : link.replace('/', '').replace('-', ' ').replace(/^\w/, (c) => c.toUpperCase())}
            </a>
          ))}
        </nav>
        {/* Logout Button */}
        <div className="mt-auto"> {/* Ensure button is at the bottom */}
          <button className="w-full h-12 bg-red-600 text-white font-semibold rounded-lg mt-4 hover:bg-red-500 transition">
            Logout
          </button>
        </div>
      </div>

      {/* User Management Content */}
      <div className="flex-1 flex flex-col p-10">
        {/* Top Row: Notification and User Info */}
        <div className="flex justify-start items-center gap-[52px] mb-6">
          <img className="Notification w-8 h-8" src="https://via.placeholder.com/32x32" alt="Notification" />
          <div className="Frame100 flex items-center gap-2">
            <div className="JuanDelaCruz text-[#1e1e1e] text-2xl font-medium font-['Nunito']">Juan Dela Cruz</div>
            <img className="Ellipse4 w-12 h-12 rounded-full" src="https://via.placeholder.com/48x48" alt="User Avatar" />
          </div>
        </div>

        <h1 className="text-[#09d1e3] text-4xl font-extrabold mb-6">User Management</h1>
        
        {/* Search Input */}
        <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2 mb-6">
          <input
            type="text"
            placeholder="Search for a user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Update search query state
            className="outline-none w-full"
          />
        </div>

        {/* User Management Content Area */}
        <p>Manage your users here.</p>
      </div>
    </div>
  );
};

export default UserManagement;
