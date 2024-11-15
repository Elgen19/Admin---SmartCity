import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue, update, get, set } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import Axios
import CustomAlert from "../components/CustomAlert";
import CustomConfirmAlert from "../components/CustomConfirmAlert"; // Import the CustomConfirmAlert component
import UserInfoModal from "../components/UserInfoModal"; // Import the new modal component
import AdminInfoModal from "../components/AdminInfoModal"; // Adjust the path as necessary
import animationData from "../assets/lottifies/promote_admin.json";
import HeaderCards from "../components/HeaderCards.js";

const ActivateDeactivateAccount = () => {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "", visible: false });
  const [confirmAlert, setConfirmAlert] = useState({
    message: "",
    id: "",
    isActive: false,
    node: "",
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAccessMessage, setShowAccessMessage] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // State for selected user
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false); // State for modal visibility

  const [hasAccess, setHasAccess] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();
  const BASE_URL = "https://smartcity-backend.vercel.app";


  useEffect(() => {
    // Check authentication state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        await checkUserAccess(user.uid); // Check user access
      } else {
        setIsAuthenticated(false);
        navigate("/"); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [navigate]);

  const checkUserAccess = async (uid) => {
    const db = getDatabase();
    const userRef = ref(db, `admins/${uid}`); // Fetch the user's data based on uid

    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const access = userData.access || ""; // Get access property
        setHasAccess(access.includes("ACTIVATE_DEACTIVATE_ACCOUNTS")); // Check for ACTIVATE_DEACTIVATE_ACCOUNTS access
        if (!access.includes("ACTIVATE_DEACTIVATE_ACCOUNTS")) {
          setShowAccessMessage(true); // Show access message
        }
      } else {
        navigate("/"); // Redirect if user data not found
      }
    } catch (error) {
      console.error("Error fetching user access:", error);
      navigate("/"); // Redirect on error
    }
  };

  const openUserInfoModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeInfoModal = () => {
    setIsModalOpen(false);
    setIsAdminModalOpen(false);
    setSelectedUser(null);
    setSelectedAdmin(null);
  };

  const handleAdminClick = (admin) => {
    setSelectedAdmin(admin);
    setIsAdminModalOpen(true);
  };

  // Fetching user accounts from Firebase
  useEffect(() => {
    const db = getDatabase();

    // Fetch Users
    const usersRef = ref(db, "Users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setUsers(userList);
      }
    });

    // Fetch Admins
    const adminsRef = ref(db, "admins");
    onValue(adminsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const adminList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setAdmins(adminList);
      }
    });
  }, []);

  // Toggle account status (activate/deactivate)
  const toggleAccountStatus = async (id, isActive, node) => {
    const db = getDatabase();
    const accountRef = ref(db, `${node}/${id}`);

    // Update the account's active status in Firebase
    try {
      await update(accountRef, { active: !isActive });

      // Determine the account type (user or admin) and fetch the email and full name
      let email, fullName, accountType;

      if (node === "Users") {
        const user = users.find((user) => user.id === id);
        if (!user) throw new Error(`User with ID ${id} not found.`);
        email = user.email;
        fullName = user.fullName;
        accountType = "User";
      } else if (node === "admins") {
        const admin = admins.find((admin) => admin.id === id);
        if (!admin) throw new Error(`Admin with ID ${id} not found.`);
        email = admin.email;
        fullName = admin.name;
        accountType = "Admin";
      } else {
        throw new Error("Invalid node specified.");
      }

      
      // Send status update to the backend
      await axios.post(`${BASE_URL}/api/status/send-status`, {
        email,
        fullName,
        isActive: !isActive,
      });

      setAlert({
        message: `${isActive ? "Deactivated" : "Activated"} successfully.`,
        type: "success",
        visible: true,
      });

      // Log admin activity
      const user = auth.currentUser;
      if (user) {
        const action = isActive
          ? `Deactivated the ${accountType} account of ${email}`
          : `Activated the ${accountType} account of ${email}`;
        await logAdminActivity(
          user.uid,
          action,
          "Activate Deactivate Account Page"
        );
      }
    } catch (error) {
      setAlert({
        message: "Error updating status: " + error.message,
        type: "error",
        visible: true,
      });
      console.error("Error updating status: ", error);
    } finally {
      setTimeout(() => setAlert({ ...alert, visible: false }), 3000); // Auto-close alert after 3 seconds
    }
  };

  // Function to open confirm alert
  const openConfirmAlert = (id, isActive, node) => {
    setConfirmAlert({
      message: `Are you sure you want to ${
        isActive ? "deactivate" : "activate"
      } this account?`,
      id,
      isActive,
      node,
    });
  };

  // Confirm action
  const confirmAction = () => {
    toggleAccountStatus(
      confirmAlert.id,
      confirmAlert.isActive,
      confirmAlert.node
    );
    setConfirmAlert({ message: "", id: "", isActive: false, node: "" }); // Reset confirm alert
  };

  // Cancel action
  const cancelAction = () => {
    setConfirmAlert({ message: "", id: "", isActive: false, node: "" }); // Reset confirm alert
  };

  if (!isAuthenticated) {
    return null;
  }

  const handleAccessMessageRedirect = () => {
    setShowAccessMessage(false);
    navigate("/home"); // Redirect to home
  };

  const logAdminActivity = async (adminId, action, page) => {
    const db = getDatabase();
    const logRef = ref(db, `ActivityLogs/${adminId}/${new Date().getTime()}`); // Unique key using timestamp under adminId

    try {
      await set(logRef, {
        action: action,
        page: page,
        timestamp: new Date().toISOString(), // Optional if you want to store a separate timestamp
      });
      console.log("Activity logged successfully");
    } catch (error) {
      console.error("Error logging admin activity:", error);
    }
  };

  return (
    <>
      <UserInfoModal
        isOpen={isModalOpen}
        onClose={closeInfoModal}
        user={selectedUser}
      />

      <AdminInfoModal
        isOpen={isAdminModalOpen}
        onClose={closeInfoModal}
        admin={selectedAdmin}
      />

      {showAccessMessage ? (
        // Show Access Denied message if the user doesn't have access
        <div className="flex items-center justify-center h-screen bg-gray-200">
          <div className="bg-red-100 border border-red-400 text-red-700 p-6 rounded-lg shadow-lg max-w-md w-full">
            <strong className="font-bold text-lg">Access Denied!</strong>
            <p className="block">
              You do not have access to view or edit profile. Contact your
              SuperAdmin if you need access.
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
        <div className="flex-1 flex flex-col overflow-y-auto font-nunito">
          {/* Custom Alert */}
          {alert.visible && (
            <CustomAlert
              message={alert.message}
              type={alert.type}
              onClose={() => setAlert({ ...alert, visible: false })}
            />
          )}

          {/* Custom Confirm Alert */}
          {confirmAlert.message && (
            <CustomConfirmAlert
              message={confirmAlert.message}
              onConfirm={confirmAction}
              onCancel={cancelAction}
            />
          )}

          <HeaderCards
            title="Activate/Deactivate Accounts"
            description=" Manage the activation and deactivation of user and admin accounts effectively."
            animationData={animationData}
          />

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search Users or Admins"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-1 rounded w-128 py-5 m-5"
          />

          {/* Users Table */}
          <div className="mb-12 px-5">
            <h2 className="text-2xl font-semibold mb-6 text-[#09d1e3]">Users</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto bg-white shadow-md rounded-lg">
                <thead className="bg-yellow-100">
                  <tr>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                      Username
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                      Email
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                      Status
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter(
                      (user) =>
                        (user.fullName &&
                          user.fullName
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())) ||
                        (user.email &&
                          user.email
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()))
                    )
                    .map((user) => (
                      <tr key={user.id} className="border-t">
                        <td className="py-4 px-6">{user.fullName}</td>
                        <td className="py-4 px-6">{user.email}</td>
                        <td className="py-4 px-6">
                          {user.active ? (
                            <span className="text-green-500 font-semibold">
                              Active
                            </span>
                          ) : (
                            <span className="text-red-500 font-semibold">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <button
                            className={`px-4 py-2 rounded text-white transition-colors duration-200 ease-in-out ${
                              user.active
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-green-500 hover:bg-green-600"
                            }`}
                            onClick={() =>
                              openConfirmAlert(user.id, user.active, "Users")
                            }
                          >
                            {user.active ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={() => openUserInfoModal(user)} // Open modal on button click
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Admins Table */}
          <div className="px-5">
            <h2 className="text-2xl font-semibold mb-6 text-[#09d1e3]">Admins</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto bg-white shadow-md rounded-lg">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                      Username
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                      Email
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                      Status
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {admins
                    .filter(
                      (admin) =>
                        admin.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        admin.email
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    )
                    .map((admin) => (
                      <tr key={admin.id} className="border-t">
                        <td className="py-4 px-6">{admin.name}</td>
                        <td className="py-4 px-6">{admin.email}</td>
                        <td className="py-4 px-6">
                          {admin.active ? (
                            <span className="text-green-500 font-semibold">
                              Active
                            </span>
                          ) : (
                            <span className="text-red-500 font-semibold">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <button
                            className={`px-4 py-2 rounded text-white transition-colors duration-200 ease-in-out ${
                              admin.active
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-green-500 hover:bg-green-600"
                            }`}
                            onClick={() =>
                              openConfirmAlert(admin.id, admin.active, "admins")
                            }
                          >
                            {admin.active ? "Deactivate" : "Activate"}
                          </button>

                          <button
                            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={() => handleAdminClick(admin)} // Open modal on button click
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActivateDeactivateAccount;
