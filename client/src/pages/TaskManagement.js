import React, { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { useNavigate } from "react-router-dom";
import adminImage from "../assets/images/Smart city (1) 2.png";
import users from "../assets/images/Users.png";
import profile from "../assets/images/profile.png";
import feedback from "../assets/images/feedback.png";
import content from "../assets/images/content.png";
import home from "../assets/images/home.png";
import activeUsers from "../assets/images/active_users.png";
import Lottie from "lottie-react";
import animationData from "../assets/lottifies/user_management.json";
import HeaderCards from "../components/HeaderCards.js";
import taskActive from "../assets/images/task_active.png";
import task from "../assets/images/task_inactive.png";

const TaskManagement = () => {
  const [activeLink, setActiveLink] = useState("/task-management");
  const [issues, setIssues] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAccessMessage, setShowAccessMessage] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClassified, setIsClassified] = useState(false); // Ensure feedback isn't reclassified

  const navigate = useNavigate();
  const db = getDatabase();
  const auth = getAuth();

  const navLinks = [
    { link: "/home", icon: home, label: "Home" },
    { link: "/profile", icon: profile, label: "Admin Profile" },
    { link: "/user-management", icon: users, label: "User Management" },
    { link: "/feedback-management", icon: feedback, label: "Feedbacks" },
    { link: "/content-management", icon: content, label: "Contents" },
    { link: "/task-management", icon: taskActive, label: "Task Management" },
  ];

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
        setHasAccess(access.includes("TASK_MANAGEMENT")); // Check for UPDATE_ADMIN_ACCESS access
        if (!access.includes("TASK_MANAGEMENT")) {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch TaskSummaries from Firebase
        const taskSummariesRef = ref(db, "TaskSummaries");
        const snapshot = await get(taskSummariesRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const tasks = Object.values(data);

          // Separate issues and suggestions
          const fetchedIssues = tasks.filter((task) => task.type === "Issues");
          const fetchedSuggestions = tasks.filter(
            (task) => task.type === "Suggestions"
          );

          setIssues(fetchedIssues);
          setSuggestions(fetchedSuggestions);
        } else {
          // Only classify if not already classified
          if (!isClassified) {
            console.log("Task summaries are empty. Calling backend...");
            await classifyFeedback();
          }
        }
      } catch (error) {
        console.error("Error fetching task summaries:", error);
      } finally {
        setLoading(false);
      }
    };

    // Check if feedback has already been classified before fetching data
    if (!isClassified) {
      fetchData();
    }
  }, [isClassified]); // Dependency array now depends on isClassified flag

  const classifyFeedback = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/issue/classify-feedback", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to classify feedback.");
      }

      const data = await response.json();
      console.log("Classified Feedback:", data);

      // Update state with classified data
      setIssues(
        data.issues.map((issue) => ({ taskDescription: issue, type: "Issues" }))
      );
      setSuggestions(
        data.suggestions.map((suggestion) => ({
          taskDescription: suggestion,
          type: "Suggestions",
        }))
      );

      // Mark the feedback as classified to avoid reclassification
      setIsClassified(true);
    } catch (error) {
      console.error("Error classifying feedback:", error);
    }
  };

  const handleAccessMessageRedirect = () => {
    setShowAccessMessage(false);
    navigate("/home"); // Redirect to home
  };

  // Handle logout function
  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate("/"); // Redirect to login after logout
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const renderTable = (title, data) => {
    return (
      <div className="mb-6">
        {data.length > 0 ? (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">{title}</h2>
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border-b border-gray-300 px-6 py-3 text-left text-sm font-semibold text-gray-600">#</th>
                  <th className="border-b border-gray-300 px-6 py-3 text-left text-sm font-semibold text-gray-600">Description</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border-b border-gray-300 px-6 py-4 text-center text-sm text-gray-700">
                      {index + 1}
                    </td>
                    <td className="border-b border-gray-300 px-6 py-4 text-sm text-gray-700">
                      {item.taskDescription}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div className="p-6 bg-red-100 border border-red-300 rounded-lg shadow-md text-center mt-5">
            <p className="text-gray-600 font-semibold">
              No data available for {title}.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {showAccessMessage ? (
        // Show Access Denied message if the user doesn't have access
        <div className="flex items-center justify-center h-screen bg-gray-200">
          <div className="bg-red-100 border border-red-400 text-red-700 p-6 rounded-lg shadow-lg max-w-md w-full">
            <strong className="font-bold text-lg">Access Denied!</strong>
            <p className="block">
              You do not have access to create and manage tasks. Contact your
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
        <div className="flex h-screen bg-white font-nunito">
          {/* Sidebar */}
          <div className="w-1/6 bg-gradient-to-b from-[#0e1550] to-[#1f2fb6] p-6 flex flex-col">
            <img
              className="w-[200px] h-[200px] mx-auto mb-10"
              src={adminImage}
              alt="Company Logo"
            />
            <nav className="space-y-6">
              {navLinks.map(({ link, icon, label }) => (
                <a
                  key={link}
                  href={link}
                  onClick={() => setActiveLink(link)}
                  className={`flex items-center text-xl transition ${
                    activeLink === link
                      ? "text-[#09d1e3] font-bold border-l-4 border-[#09d1e3] pl-3"
                      : "text-white hover:text-[#09d1e3]"
                  }`}
                  style={{ textDecoration: "none" }}
                >
                  <img
                    className="w-8 h-8 mr-3 transition"
                    src={activeLink === link ? activeUsers : icon}
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
          <div className="flex-grow p-6">
            <HeaderCards
              title="Task Management"
              description="Organize and track tasks efficiently to address feedback and enhance app performance."
              animationData={animationData}
            />

            {loading ? (
              <p>Loading tasks...</p>
            ) : (
              <>
                {/* Render tables for issues and suggestions */}
                {renderTable("Issues", issues)}
                {renderTable("Suggestions", suggestions)}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TaskManagement;
