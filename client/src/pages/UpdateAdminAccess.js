import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, update, set } from 'firebase/database';
import CustomAlert from '../components/CustomAlert'; // Import your CustomAlert component
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import animationData from '../assets/lottifies/security.json';
import HeaderCards from '../components/HeaderCards.js';

const UpdateAdminAccess = () => {
  const [admins, setAdmins] = useState([]);
  const [selectedAccess, setSelectedAccess] = useState({});
  const [alert, setAlert] = useState({ message: '', type: '', visible: false }); // State for alert
  const [showAccessMessage, setShowAccessMessage] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const db = getDatabase();
  const auth = getAuth();
  const navigate = useNavigate();


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
        setHasAccess(access.includes("UPDATE_ADMIN_ACCESS")); // Check for UPDATE_ADMIN_ACCESS access
        if (!access.includes("UPDATE_ADMIN_ACCESS")) {
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

  // Access types with descriptions
  const availableAccessTypes = {
    FEEDBACK_MANAGEMENT: 'Manage user feedback',
    HOME: 'Access the home dashboard',
    CONTENT_MANAGEMENT: 'Create and manage content',
    VIEW_USER_INFORMATION: 'View information of registered users',
    ADMIN_ACTIVITY_LOGS: 'View logs of admin activities',
    NOTIFICATIONS: 'Manage notifications settings',
    ADMIN_PROFILE: 'Edit your admin profile',
    TASK_MANAGEMENT: 'Create and manage task from issues'
  };

  // Fetching all admins except SuperAdmin
  const fetchAdmins = async () => {
    try {
      const allAdminsRef = ref(db, 'admins');
      const snapshot = await get(allAdminsRef);
  
      if (snapshot.exists()) {
        const allAdmins = snapshot.val();
        const filteredAdmins = Object.keys(allAdmins)
          .filter(adminId => 
            allAdmins[adminId].role !== 'SuperAdmin' && 
            allAdmins[adminId].isApproved === true // Only include if isApproved is true
          )
          .map(adminId => ({
            id: adminId,
            ...allAdmins[adminId],
          }));
          
        setAdmins(filteredAdmins);
  
        // Initialize selected access for each admin
        const accessState = {};
        filteredAdmins.forEach(admin => {
          accessState[admin.id] = admin.access ? admin.access.split(',').map(a => a.trim()) : [];
        });
        setSelectedAccess(accessState); // Store as an array of access for each admin
      } else {
        showAlert('No data available.', 'error');
      }
    } catch (err) {
      showAlert('Error fetching admins.', 'error');
    }
  };
  

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Show alert
  const showAlert = (message, type) => {
    setAlert({ message, type, visible: true });
    setTimeout(() => {
      setAlert({ ...alert, visible: false });
    }, 3000); // Hide after 3 seconds
  };

  const closeAlert = () => {
    setAlert({ ...alert, visible: false });
  };

  // Handle checkbox toggle for access
  const handleAccessToggle = (adminId, accessType) => {
    const currentAccess = selectedAccess[adminId];
    if (currentAccess.includes(accessType)) {
      setSelectedAccess({
        ...selectedAccess,
        [adminId]: currentAccess.filter(access => access !== accessType),
      });
    } else {
      setSelectedAccess({
        ...selectedAccess,
        [adminId]: [...currentAccess, accessType],
      });
    }
  };

  const saveAccessChanges = async (adminId) => {
    try {
      const updatedAccess = selectedAccess[adminId].join(','); // Convert access array back to a string
      const adminRef = ref(db, `admins/${adminId}`);
  
      // Get the current admin details, including email and previous access
      const adminSnapshot = await get(adminRef);
      const adminData = adminSnapshot.val();
      const previousAccess = adminData.access ? adminData.access.split(',') : [];
      const email = adminData.email; // Fetch the admin's email
  
      await update(adminRef, { access: updatedAccess }); // Update access property in Firebase
      showAlert('Admin access updated successfully.', 'success');
  
      // Determine the new access changes
      const newAccessAdded = selectedAccess[adminId].filter(access => !previousAccess.includes(access)).join(', ');
      const newAccessRemoved = previousAccess.filter(access => !selectedAccess[adminId].includes(access)).join(', ');
  
      const user = auth.currentUser;
      if (user) {
        const actionMessage = `Updated access for ${email}. Added: [${newAccessAdded}] Removed: [${newAccessRemoved}]`;
        await logAdminActivity(user.uid, actionMessage, "Update Admin Access Page");
      }
    } catch (error) {
      showAlert('Error updating access.', 'error');
    }
  };
  

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
      {showAccessMessage ? (
        // Show Access Denied message if the user doesn't have access
        <div className="flex items-center justify-center h-screen bg-gray-200">
          <div className="bg-red-100 border border-red-400 text-red-700 p-6 rounded-lg shadow-lg max-w-md w-full">
            <strong className="font-bold text-lg">Access Denied!</strong>
            <p className="block">
              You do not have access to update admin access. Contact your SuperAdmin if you need access.
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
     <div className="font-nunito w-full  flex-col overflow-y-auto">
      {alert.visible && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={closeAlert}
        />
      )}
      <HeaderCards
        title="Update Admin Access"
        description="Modify the access permissions for each admin as needed."
        animationData={animationData}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-5 px-5 py-3">
        {admins.length > 0 ? (
          admins.map((admin) => (
            <div key={admin.id} className="bg-yellow-100 shadow-md rounded-lg p-6">
              <div className="flex flex-col space-y-2">
                <p className="text-lg font-bold text-gray-900 nunito-font">{admin.name}</p>
                <p className="text-sm text-gray-500 nunito-font">{admin.email}</p>

                {/* Access List */}
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-600 nunito-font">Modify Access:</h3>

                  <div className="mt-2">
                    {Object.keys(availableAccessTypes).map((accessType, index) => (
                      <label key={index} className="block text-sm nunito-font">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={selectedAccess[admin.id]?.includes(accessType)} // Pre-select if access matches
                          onChange={() => handleAccessToggle(admin.id, accessType)}
                        />
                        <span>{availableAccessTypes[accessType]}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Save Changes Button */}
                <div className="mt-6">
                  <button
                    className="mt-4 px-4 py-2 bg-teal-400 text-white rounded-md hover:bg-blue-600 transition duration-200"
                    onClick={() => saveAccessChanges(admin.id)} // Call save function on click
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <p className="text-gray-600">No admins found for update.</p>
          </div>
        )}
      </div>
    </div> )}
    </>
    
  );
};

export default UpdateAdminAccess;
