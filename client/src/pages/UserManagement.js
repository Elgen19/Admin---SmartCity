import React, { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import adminImage from "../assets/images/Smart city (1) 2.png";
import users from "../assets/images/Users.png";
import profile from "../assets/images/profile.png";
import feedback from "../assets/images/feedback.png";
import content from "../assets/images/content.png";
import home from "../assets/images/home.png";
import activeUsers from "../assets/images/active_users.png";
import Lottie from 'lottie-react'
import animationData from '../assets/lottifies/user_management.json';
import HeaderCards from '../components/HeaderCards.js';
import task from "../assets/images/task_inactive.png";


const UserManagement = () => {
  const [activeLink, setActiveLink] = useState("/user-management");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAccessMessage, setShowAccessMessage] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  const navigate = useNavigate();

  const navLinks = [
    { link: "/home", icon: home, label: "Home" },
    { link: "/profile", icon: profile, label: "Admin Profile" },
    { link: "/user-management", icon: users, label: "User Management" },
    { link: "/feedback-management", icon: feedback, label: "Feedbacks" },
    { link: "/content-management", icon: content, label: "Contents" },
   // { link: "/task-management", icon: task, label: "Task Management" },

  ];

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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

  // Handlers for card options
  const handleSendInvite = () => {
    navigate("/invite"); // Navigate to the invite page
  };

  const handleApproveDenyAdmins = () => {
    navigate("/approve-deny-admins"); // Navigate to the approve/deny admins page
  };


  const handleUpdateAdminPermission = () => {
    navigate("/update-admin-permission"); // Navigate to the update admin permission page
  };

  const handleViewAdminActivityLogs = () => {
    navigate("/admin-activity-logs"); // Navigate to the admin activity logs page
  };

  const handleActivateDeactivateAccounts = () => {
    navigate("/activate-deactivate-account"); // Navigate to the admin activity logs page
  };

  const handleAccessMessageRedirect = () => {
    setShowAccessMessage(false);
    navigate("/home"); // Redirect to home
  };

  const handlePromoteAdmins = () => {
    navigate("/promote-admin"); // Navigate to the admin activity logs page
  };

  

  return (
     <> {showAccessMessage ? (
      // Show Access Denied message if the user doesn't have access
      <div className="flex items-center justify-center h-screen bg-gray-200">
        <div className="bg-red-100 border border-red-400 text-red-700 p-6 rounded-lg shadow-lg max-w-md w-full">
          <strong className="font-bold text-lg">Access Denied!</strong>
          <p className="block">
            You do not have access to invite new admins. Contact your SuperAdmin if you need access.
          </p>
          <div className="mt-4">
            <button
              onClick={handleAccessMessageRedirect}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    ) : (
      <div className="flex h-screen bg-white font-nunito">
        {/* Sidebar */}
        <div className="fixed left-0 top-0 bottom-0 w-1/6 bg-gradient-to-b from-[#0e1550] to-[#1f2fb6] p-6 flex flex-col overflow-hidden">
  <img
    className="w-[200px] h-[200px] mx-auto mb-10"
    src={adminImage} // Updated with your image path
    alt="Company Logo"
  />
  <nav className="space-y-6 overflow-y-auto">
    {navLinks.map(({ link, icon, label }) => (
      <a
        key={link}
        href={link}
        onClick={() => setActiveLink(link)}
        className={`flex items-center text-xl transition ${
          activeLink === link
            ? "text-[#09d1e3] font-bold border-l-4 border-[#09d1e3] pl-3" // Active link color
            : "text-white hover:text-[#09d1e3]"
        }`}
        style={{ textDecoration: "none" }}
      >
        <img
          className="w-8 h-8 mr-3 transition"
          src={activeLink === link ? activeUsers : icon} // Use active icon if link is active
          alt={`${label} Icon`}
        />
        {label}
      </a>
    ))}
  </nav>
  <div className="mt-auto">
    <button
      onClick={handleLogout}
      className="w-full h-12 bg-red-600 text-white font-semibold rounded-lg mt-4 hover:bg-red-500 transition"
    >
      Logout
    </button>
  </div>
</div>

        {/* Options Card Section */}
        <div className="ml-[20%] p-6 ">
          {/* Header with Title */}
          <HeaderCards
        title="User Management"
        description="Manage user and admin operations efficiently, including sending admin invitations, approving registrations, updating access levels, viewing activity logs, and controlling account statuses. You can activate or deactivate user/admin accounts and promote admins as needed to ensure smooth user management."
        animationData={animationData}
      />

          {/* Card for Options */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Card for Send Invite */}
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
              <h2 className="text-lg font-bold mb-2">Send Invite</h2>
              <p className="text-gray-600 mb-4">Invite new users to join.</p>
              <button
                onClick={handleSendInvite}
                className="bg-[#09d1e3] text-white px-4 py-2 rounded-lg hover:bg-[#08b3d3] transition"
              >
                Send Invite
              </button>
            </div>

            {/* Card for Approve/Deny Admins */}
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
              <h2 className="text-lg font-bold mb-2">Approve/Deny Admins</h2>
              <p className="text-gray-600 mb-4">Manage admin permissions.</p>
              <button
                onClick={handleApproveDenyAdmins}
                className="bg-[#09d1e3] text-white px-4 py-2 rounded-lg hover:bg-[#08b3d3] transition"
              >
                Approve/Deny
              </button>
            </div>

          

            {/* Card for Update Admin Access */}
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
              <h2 className="text-lg font-bold mb-2">
                Update Admin Permission
              </h2>
              <p className="text-gray-600 mb-4">
                Updates the admin access and permissions on the system.
              </p>
              <button
                onClick={handleUpdateAdminPermission}
                className="bg-[#09d1e3] text-white px-4 py-2 rounded-lg hover:bg-[#08b3d3] transition"
              >
                Update Permissions
              </button>
            </div>

            {/* Card for View Admin Activity Logs */}
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
              <h2 className="text-lg font-bold mb-2">Admin Activity Logs</h2>
              <p className="text-gray-600 mb-4">
                View what your administrators are up to.
              </p>
              <button
                onClick={handleViewAdminActivityLogs}
                className="bg-[#09d1e3] text-white px-4 py-2 rounded-lg hover:bg-[#08b3d3] transition"
              >
                View Logs
              </button>
            </div>



             {/* Card for Activate Deactivate Accounts */}
             <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
              <h2 className="text-lg font-bold mb-2">Activate/Deactivate Accounts</h2>
              <p className="text-gray-600 mb-4">
                Activate or Deactivate Admin or User Accounts.
              </p>
              <button
                onClick={handleActivateDeactivateAccounts}
                className="bg-[#09d1e3] text-white px-4 py-2 rounded-lg hover:bg-[#08b3d3] transition"
              >
                Activate/Deactivate
              </button>
            </div>


             {/* Card for Admin Promotion */}
             <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
              <h2 className="text-lg font-bold mb-2">Promote Admin</h2>
              <p className="text-gray-600 mb-4">
                Promote admins to SuperAdmin role.  
              </p>
              <button
                onClick={handlePromoteAdmins}
                className="bg-[#09d1e3] text-white px-4 py-2 rounded-lg hover:bg-[#08b3d3] transition"
              >
                Promote
              </button>
            </div>


          </div>
        </div>
      </div> )}
     </>
  );
};

export default UserManagement;
