import React, { useState, useEffect } from "react";
import { getDatabase, ref, get, update, remove, set } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/lottifies/loading.json"; // Make sure to update the path to your loading.json file
import animationData from "../assets/lottifies/approved.json";
import HeaderCards from "../components/HeaderCards.js";

const ApproveDenyAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const db = getDatabase();
  const auth = getAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAccessMessage, setShowAccessMessage] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  const navigate = useNavigate();
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
    const userRef = ref(db, `admins/${uid}`); // Fetch the user's data based on uid

    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const access = userData.access || ""; // Get access property
        setHasAccess(access.includes("APPROVE_DENY_ADMIN_REGISTRATION")); // Check for APPROVE_DENY_ADMIN_REGISTRATION access
        if (!access.includes("APPROVE_DENY_ADMIN_REGISTRATION")) {
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

  // Fetching unapproved admins from Firebase
  const fetchUnapprovedAdmins = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("You must be logged in to view this content.");
      return;
    }

    const adminRef = ref(db, `admins/${user.uid}`);
    const snapshot = await get(adminRef);

    if (snapshot.exists() && snapshot.val().isApproved) {
      const allAdminsRef = ref(db, "admins");
      const allAdminsSnapshot = await get(allAdminsRef);
      if (allAdminsSnapshot.exists()) {
        const allAdmins = allAdminsSnapshot.val();
        const unapprovedAdmins = Object.keys(allAdmins)
          .filter((adminId) => !allAdmins[adminId].isApproved)
          .map((adminId) => ({
            id: adminId,
            ...allAdmins[adminId],
          }));
        setAdmins(unapprovedAdmins);
      } else {
        toast.error("No data available.");
      }
    } else {
      toast.error(
        "Permission denied: You are not authorized to view this content or you are not approved yet."
      );
    }
  };

  useEffect(() => {
    fetchUnapprovedAdmins();
  }, []);

  // Approve an admin
  const handleApprove = async (adminId, adminEmail, adminName) => {
    setLoading(true); // Set loading to true
    const adminRef = ref(db, `admins/${adminId}`);
    try {
      await update(adminRef, { isApproved: true });
      toast.success("Admin approved successfully!");

      
      await axios.post(`${BASE_URL}/api/notify/email-admin`, {
        email: adminEmail,
        name: adminName,
        action: "approve",
      });

      fetchUnapprovedAdmins(); // Refresh the list

      const user = auth.currentUser;
      if (user) {
        await logAdminActivity(
          user.uid,
          `Approved admin registration for ${adminEmail}`,
          "Approve Deny Admin Page"
        );
      }
    } catch (err) {
      toast.error("Error approving admin");
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  // Deny an admin
  const handleDeny = async (adminId, adminEmail, adminName) => {
    setLoading(true); // Set loading to true
    const adminRef = ref(db, `admins/${adminId}`);
    try {
      await remove(adminRef);
      toast.info("Admin request denied.");

      await axios.post(`${BASE_URL}/api/notify/email-admin`, {
        email: adminEmail,
        name: adminName,
        action: "deny",
      });

      const user = auth.currentUser;
      if (user) {
        await logAdminActivity(
          user.uid,
          `Denied admin registration for ${adminEmail}`,
          "Approve Deny Admin Page"
        );
      }

      fetchUnapprovedAdmins(); // Refresh the list
    } catch (err) {
      toast.error("Error denying admin request");
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  // Lottie animation configuration
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen"
        style={{
          background: "linear-gradient(to bottom, #0E1550 30%, #2030B6 100%)",
          fontFamily: "Nunito, sans-serif",
        }}
      >
        <div className="flex flex-col items-center space-y-4">
          <Lottie
            animationData={loadingAnimation}
            loop={true}
            style={{ width: 100, height: 100 }}
          />
          <p className="text-lg font-semibold text-white">
            Processing your request. Please wait...
          </p>
        </div>
      </div>
    );
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
      {showAccessMessage ? (
        // Show Access Denied message if the user doesn't have access
        <div className="flex items-center justify-center h-screen bg-gray-200">
          <div className="bg-red-100 border border-red-400 text-red-700 p-6 rounded-lg shadow-lg max-w-md w-full">
            <strong className="font-bold text-lg">Access Denied!</strong>
            <p className="block">
              You do not have access to approve or deny incoming admins. Contact
              your SuperAdmin if you need access.
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
        <div
          className="w-full  flex-col overflow-y-auto"
          style={{ fontFamily: "Nunito, sans-serif" }}
        >
          <HeaderCards
            title="Approve or Deny Admin Registration"
            description="Manage the approval process for new admin registrations. Review requests and decide whether to approve or deny access to the admin panel."
            animationData={animationData}
          />

          {admins.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 mt-5 px-5 py-3">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="bg-blue-100 shadow-md p-4 rounded-lg flex justify-between items-center transition duration-300 ease-in-out hover:shadow-lg"
                >
                  <div>
                    <p className=" text-lg font-semibold">{admin.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {admin.email}
                    </p>{" "}
                    {/* Added mt-1 to reduce spacing */}
                    <p className="text-xs text-gray-400">
                      {formatTimestamp(admin.createdAt)}
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200"
                      onClick={() =>
                        handleApprove(admin.id, admin.email, admin.name)
                      }
                    >
                      Approve
                    </button>
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200"
                      onClick={() =>
                        handleDeny(admin.id, admin.email, admin.name)
                      }
                    >
                      Deny
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-red-100 shadow-md rounded-lg p-6  flex items-center justify-center mt-6">
              <p className="text-gray-600 text-lg font-semibold">
                No admin approval requests at the moment.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ApproveDenyAdmin;
