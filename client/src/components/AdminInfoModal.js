// AdminInfoModal.js
import React from 'react';

// Mapping of access codes to their descriptions
const accessDescriptions = {
  FEEDBACK_MANAGEMENT: 'Manage user feedback',
  HOME: 'Access the home dashboard',
  CONTENT_MANAGEMENT: 'Create and manage content',
  INVITE_NEW_ADMIN: 'Invite new admins to the system',
  APPROVE_DENY_ADMIN_REGISTRATION: 'Approve or deny admin registrations',
  VIEW_USER_INFORMATION: 'View information of registered users',
  UPDATE_ADMIN_ACCESS: 'Modify access permissions for other admins',
  ADMIN_ACTIVITY_LOGS: 'View logs of admin activities',
  NOTIFICATIONS: 'Manage notifications settings',
  ADMIN_PROFILE: 'Edit your admin profile',
  USER_MANAGEMENT: 'Manage user accounts',
  ACTIVATE_DEACTIVATE_ACCOUNTS: 'Activate or deactivate user accounts',
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', // Use 'long' to get the full month name
    day: 'numeric',
  });
};


const AdminInfoModal = ({ isOpen, onClose, admin }) => {
  if (!isOpen) return null;

  console.log('Admin Object:', admin); // Log the admin object for debugging

  // Split the access codes into an array
  const accessCodesArray = admin.access ? admin.access.split(', ') : [];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-blue-100 p-6 rounded-lg shadow-lg max-w-md w-full"> {/* Solid light blue background */}
        <h2 className="text-xl font-bold mb-4 text-center text-[#09d1e3] font-nunito">Admin Information</h2>

        {/* Admin information with spacing */}
        <p className="flex items-center mb-2">
          <span className="material-icons mr-2">person</span>
          <strong>Name:</strong> <span className="ml-1">{admin.name}</span>
        </p>
        <p className="flex items-center mb-2">
          <span className="material-icons mr-2">email</span>
          <strong>Email:</strong> <span className="ml-1">{admin.email}</span>
        </p>
        <p className="flex items-center mb-2">
          <span className="material-icons mr-2">phone</span>
          <strong>Phone Number:</strong> <span className="ml-1">{admin.phoneNumber}</span>
        </p>
        <p className="flex items-center mb-2">
          <span className="material-icons mr-2">verified</span>
          <strong>Status:</strong> <span className="ml-1">{admin.active ? 'ACTIVE' : 'DEACTIVATED'}</span>
        </p>
        <p className="flex items-center mb-2">
          <span className="material-icons mr-2">date_range</span>
          <strong>Date Registered:</strong> <span className="ml-1">{formatDate(admin.createdAt)}</span>
        </p>
        <p className="flex items-center mb-2">
          <span className="material-icons mr-2">assignment_ind</span>
          <strong>Role:</strong> <span className="ml-1">{admin.role}</span>
        </p>

        {/* Access Codes and Descriptions */}
        <h3 className="font-semibold mt-4">Access Codes:</h3>
        <div className="mt-2">
          {accessCodesArray.length > 0 ? (
            accessCodesArray.map((code) => (
              <p key={code} className="flex items-center mb-1">
                <span className="material-icons mr-2">check_circle</span>
                <span>{accessDescriptions[code] || 'Description not available.'}</span> {/* Only show the description */}
              </p>
            ))
          ) : (
            <p>No access codes available.</p>
          )}
        </div>

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

export default AdminInfoModal;
