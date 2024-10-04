// UserInfoModal.js
import React from 'react';

// Function to format timestamp to a readable date
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }); // Customize this format as needed
};

const UserInfoModal = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-blue-100 p-6 rounded-lg shadow-lg max-w-md w-full"> {/* Solid light blue background */}
        <h2 className="text-xl font-bold mb-4 text-center text-[#09d1e3] font-nunito">User Information</h2>

        {/* Centered profile picture */}
        <div className="flex flex-col items-center mb-4">
          <img
            src={user.profilePicUrl}
            alt={`${user.fullName}'s Profile`}
            className="w-32 h-32 rounded-full mb-2 border-4 border-white shadow-lg" // Increased size of the profile picture with a border
          />
        </div>

        {/* User information with spacing */}
        <p className="flex items-center mb-2">
          <span className="material-icons mr-2">person</span>
          <strong>Name:</strong> <span className="ml-1">{user.fullName}</span>
        </p>
        <p className="flex items-center mb-2">
          <span className="material-icons mr-2">email</span>
          <strong>Email:</strong> <span className="ml-1">{user.email}</span>
        </p>
        <p className="flex items-center mb-2">
          <span className="material-icons mr-2">phone</span>
          <strong>Phone Number:</strong> <span className="ml-1">{user.phoneNumber}</span>
        </p>
        <p className="flex items-center mb-2">
          <span className="material-icons mr-2">star</span> {/* Icon for points */}
          <strong>Points:</strong> <span className="ml-1">{user.points}</span>
        </p>
        <p className="flex items-center mb-2">
          <span className="material-icons mr-2">verified_user</span>
          <strong>Account Status:</strong> <span className="ml-1">{user.active ? 'ACTIVE' : 'DEACTIVATED'}</span>
        </p>
        <p className="flex items-center mb-2">
          <span className="material-icons mr-2">access_time</span>
          <strong>Last Active:</strong> <span className="ml-1">{formatDate(user.lastActive)}</span>
        </p>

        <div className="mt-4 flex justify-end">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" 
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInfoModal;
