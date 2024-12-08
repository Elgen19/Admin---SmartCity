import React, { useState, useEffect, useCallback } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get, child, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import '@fortawesome/fontawesome-free/css/all.min.css';


import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import adminImage from "../assets/images/Smart city (1) 2.png";
import users from "../assets/images/Users.png";
import profile from "../assets/images/profile.png";
import feedback from "../assets/images/feedback.png";
import content from "../assets/images/content.png";
import home from "../assets/images/home.png";
import notificationBell from "../assets/images/notification-bell.png";
import activeHome from "../assets/images/active_home.png"
import Lottie from 'lottie-react'
import userAnimation from '../assets/lottifies/users.json'; // Replace with actual path
import feedbackAnimation from '../assets/lottifies/feeback.json'; // Replace with actual path
import contentUpdateAnimation from '../assets/lottifies/announcement.json'; // Replace with actual path
import task from "../assets/images/task_inactive.png";



const Home = () => {
  
  const [feedbackSummary, setFeedbackSummary] = useState({});
  const [activeLink, setActiveLink] = useState("/home");
  const [adminName, setAdminName] = useState("");
  const [greeting, setGreeting] = useState("");
  const [userCount, setUserCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [contentUpdates, setContentUpdates] = useState(0);
  const [activeUsersData, setActiveUsersData] = useState([]);
  const [selectedReport, setSelectedReport] = useState("All");
  const [selectedReportForAnalysis, setSelectedReportAnalysis] = useState("Application Rating Overview");
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("1 Minute");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adminContents, setAdminContents] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const BASE_URL = "https://smartcity-backend.vercel.app";

  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const database = getDatabase()

    // Fetch contents targeted to admins from Firebase
  useEffect(() => {
    const contentsRef = ref(database, "Contents");

    onValue(contentsRef, (snapshot) => {
      const contentsData = snapshot.val();
      const filteredContents = [];

      for (const contentId in contentsData) {
        const content = contentsData[contentId];
        if (content.audience === "admins") {
          filteredContents.push({ id: contentId, ...content });
        }
      }

      setAdminContents(filteredContents);
    });
  }, [database]);

  // Open dialog with selected content details
  const handleViewClick = (content) => {
    setSelectedContent(content);
    setIsDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedContent(null);
  };


  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchAdminName(user.uid);
        fetchDashboardData();
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleNotificationClick = () => {
    navigate("/notification"); // Navigate to /notification when the bell is clicked
  };





  const fetchAdminName = async (uid) => {
    const db = getDatabase();
    const adminRef = ref(db, `admins/${uid}`);
    try {
      const snapshot = await get(adminRef);
      if (snapshot.exists()) {
        const adminData = snapshot.val();
        setAdminName(adminData.name || "Admin");
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };


  


  const fetchAnalysis = async (reportType) => {
    setLoading(true);
    setError(null);

    try {
      if (reportType === 'Bug Analysis Report') {
        // Fetch bug analysis report
        const response = await axios.get(`${BASE_URL}/api/ai/analyze-feedback`); // Endpoint for analysis

        // Remove "Summary:" from the beginning of the response string
        const cleanAnalysis = response.data.analysis.replace(/^Summary:\s*/, '');
        setAnalysis(cleanAnalysis); // Set the cleaned analysis result

      } else if (reportType === 'Application Rating Overview') {
        // Fetch rating analysis report
        const response = await axios.get(`${BASE_URL}/api/rating/get-ratings`); // Endpoint for ratings
        const { highestRating, lowestRating, averageRating } = response.data;

        // Log the returned values for debugging
        console.log("Ratings data:", { highestRating, lowestRating, averageRating });

        // Ensure that averageRating is a number before calling toFixed()
        const average = typeof averageRating === 'string' ? parseFloat(averageRating).toFixed(2) : averageRating.toFixed(2);
        const highest = typeof highestRating === 'number' ? highestRating : 'N/A';
        const lowest = typeof lowestRating === 'number' ? lowestRating : 'N/A';

        const getRatingClass = (rating) => {
          if (rating > 3) {
            return "text-green-500 font-bold"; // Green for ratings greater than 3
          } else if (rating === 3) {
            return "text-yellow-500 font-bold"; // Yellow for ratings equal to 3
          } else {
            return "text-red-500 font-bold"; // Red for ratings less than 3
          }
        };
        
        const ratingAnalysis = (
          <div>
            <p className={getRatingClass(highest)}>
              Highest Rating: <span>{highest}</span>
            </p>
            <p className={getRatingClass(lowest)}>
              Lowest Rating: <span>{lowest}</span>
            </p>
            <p className={getRatingClass(average)}>
              Average Rating: <span>{average}</span>
            </p>
          </div>
        );

       
        
        setAnalysis(ratingAnalysis); // Set the ratings analysis result
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
      setError("Error fetching analysis."); // Handle errors
    } finally {
      setLoading(false);
    }
  };

  // Fetch analysis when the component mounts or when the selected report changes
  useEffect(() => {
    fetchAnalysis(selectedReportForAnalysis); // Fetch based on the current selected report
  }, [selectedReportForAnalysis]); // Depend on selectedReportForAnalysis to refetch when it changes

  
  
  

  const fetchFeedbackSummary = async () => {
    const db = getDatabase();
    const feedbackRef = ref(db, "Feedback");

    try {
      const snapshot = await get(feedbackRef);
      if (snapshot.exists()) {
        const feedbacks = snapshot.val();
        const summary = {};

        Object.values(feedbacks).forEach((feedback) => {
          const type = feedback.type;
          summary[type] = (summary[type] || 0) + 1;
        });

        setFeedbackSummary(summary);
      }
    } catch (error) {
      console.error("Error fetching feedback summary:", error);
    }
  };

  useEffect(() => {
    fetchFeedbackSummary();
  }, []);

  const fetchDashboardData = async () => {
    const db = getDatabase();
    const dbRef = ref(db);

    try {
      // Fetch number of users
      const usersSnapshot = await get(child(dbRef, "Users"));
      if (usersSnapshot.exists()) {
        setUserCount(Object.keys(usersSnapshot.val()).length);
      }

      // Fetch number of feedbacks
      const feedbackSnapshot = await get(child(dbRef, "Feedback"));
      if (feedbackSnapshot.exists()) {
        setFeedbackCount(Object.keys(feedbackSnapshot.val()).length);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  // Memoized countActiveUsers function
  const countActiveUsers = useCallback(() => {
    const db = getDatabase();
    const usersRef = ref(db, "Users");

    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const currentTime = Date.now();

        const timeFrameDuration = {
          "1 Minute": 1 * 60 * 1000,
          "5 Minutes": 5 * 60 * 1000,
          "10 Minutes": 10 * 60 * 1000,
        };

        const activeUsers = Object.values(usersData).filter(
          (user) =>
            currentTime - user.lastActive <=
            timeFrameDuration[selectedTimeFrame]
        );

        setActiveUsersData((prevData) => [
          ...prevData,
          { time: new Date().toLocaleTimeString(), count: activeUsers.length },
        ]);
      }
    });
  }, [selectedTimeFrame]); // Include selectedTimeFrame as a dependency

  useEffect(() => {
    countActiveUsers();
  }, [countActiveUsers]);

  useEffect(() => {
    const hours = new Date().getHours();
    let greetingMessage = "Good morning";
  
    if (hours >= 12 && hours < 18) {
      greetingMessage = "Good afternoon";
    } else if (hours >= 18 || hours < 5) {
      greetingMessage = "Good evening";
    }
  
    setGreeting({
      message: greetingMessage,
      name: adminName.split(" ")[0], // Get the first name
    });
  }, [adminName]);

  const navLinks = [
    { link: "/home", icon: home, label: "Home" },
    { link: "/profile", icon: profile, label: "Admin Profile" },
    { link: "/user-management", icon: users, label: "User Management" },
    { link: "/feedback-management", icon: feedback, label: "Feedbacks" },
    { link: "/content-management", icon: content, label: "Contents" },
    { link: "/task-management", icon: task, label: "Task Management" },
  ];

  const handleLogout = () => {
    navigate("/");
  };

  const filterFeedbackSummary = () => {
    if (selectedReport === "All") return feedbackSummary;
    return Object.keys(feedbackSummary)
      .filter((type) => type === selectedReport)
      .reduce((obj, key) => {
        obj[key] = feedbackSummary[key];
        return obj;
      }, {});
  };

  
  return (
    <div className="flex h-screen bg-white font-nunito">
     {/* Sidebar */}
<div className="w-1/6 bg-gradient-to-b from-[#0e1550] to-[#1f2fb6] p-6 flex flex-col overflow-hidden">
    <img
        className="w-[200px] h-[200px] mx-auto mb-10"
        src={adminImage} // Updated with your image path
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
                        ? "text-[#09d1e3] font-bold border-l-4 border-[#09d1e3] pl-3" // Active link color
                        : "text-white hover:text-[#09d1e3]"
                }`}
                style={{ textDecoration: "none" }}
            >
                <img
                    className="w-8 h-8 mr-3 transition"
                    src={activeLink === link ? activeHome: icon} // Use active icon if link is active
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        {/* Greeting and Notification Row */}
        <div className="flex items-center justify-between w-full mb-6">
    <label className="text-[28px] font-bold text-[#141d70]">
      <span className="font-extrabold text-[#09d1e3]">{greeting.message},</span> <span className="font-normal">{greeting.name}</span>!
    </label>
    <button className="ml-4 bg-transparent p-0 border-none" onClick={handleNotificationClick}>
      <img src={notificationBell} alt="Notification Bell" className="w-8 h-8" />
    </button>
  </div>

      

{/* Statistics Cards */}
<div className="grid grid-cols-3 gap-4 mb-4">
  {/* Users Card */}
  <div className="bg-[#1976d2] rounded-lg p-4 shadow-md transform transition duration-300 hover:scale-105 flex items-center">
    {/* Lottie Animation */}
    <div className="w-16 h-16 mr-4">
      <Lottie animationData={userAnimation} loop={true} className="w-full h-full" />
    </div>
    <div>
      <p className="text-white text-xl font-bold">Total Users</p>
      <p className="text-white text-5xl font-semibold">{userCount}</p> {/* Enlarged number */}
    </div>
  </div>

  {/* Feedback Card */}
  <div className="bg-[#0288d1] rounded-lg p-4 shadow-md transform transition duration-300 hover:scale-105 flex items-center">
    {/* Lottie Animation */}
    <div className="w-16 h-16 mr-4">
      <Lottie animationData={feedbackAnimation} loop={true} className="w-full h-full" />
    </div>
    <div>
      <p className="text-white text-l font-bold">Feedback</p>
      <p className="text-white text-xl font-semibold">{feedbackCount}</p> {/* Enlarged number */}
    </div>
  </div>

  {/* Content Updates Card */}
  <div className="bg-[#03a9f4] rounded-lg p-4 shadow-md transform transition duration-300 hover:scale-105 flex items-center">
    {/* Lottie Animation */}
    <div className="w-16 h-16 mr-4">
      <Lottie animationData={contentUpdateAnimation} loop={true} className="w-full h-full" />
    </div>
    <div>
      <p className="text-white text-lg font-bold">Content Updates</p>
      <p className="text-white text-xl font-semibold">{contentUpdates}</p> {/* Enlarged number */}
    </div>
  </div>
</div>





        {/* Dropdowns and Charts Section */}
        <div className="grid grid-cols-2 gap-4 mb-6 mt-3">
          {/* Dropdown for Time Frame Analysis */}
          <div className="relative w-full max-w-xs">
            <label className="mb-1 text-sm font-medium text-[#141d70]">
              Select Time Frame for Active Users
            </label>
            <select
              className="p-2 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedTimeFrame}
              onChange={(e) => setSelectedTimeFrame(e.target.value)}
            >
              <option value="1 Minute">Last 1 Minute</option>
              <option value="5 Minutes">Last 5 Minutes</option>
              <option value="10 Minutes">Last 10 Minutes</option>
            </select>
          </div>

          {/* Dropdown for Feedback Summary Report Type */}
          <div className="relative w-full max-w-xs">
            <label className="mb-1 text-sm font-medium text-[#141d70]">
              Select Report Type for Feedback Summary
            </label>
            <select
              className="p-2 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Bug Report">Bug Report</option>
              <option value="Feature Request">Feature Request</option>
              <option value="General Feedback">General Feedback</option>
            </select>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-4">
          {/* Line Chart for Active Users */}
          <div className="bg-[#f0f8ff] p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-4 text-[#09d1e3]">Active Users</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activeUsersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#09d1e3"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart for Feedback Summary */}
          <div className="bg-[#f0f8ff] p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-4 text-[#09d1e3]">Feedback Summary</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={Object.entries(filterFeedbackSummary()).map(
                  ([type, count]) => ({ type, count })
                )}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#09d1e3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>








 {/* Admin Content Table Section */}
 <div className="flex h-screen bg-white font-nunito px-0">
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        {/* Admin Content Table Section */}
        <div >
          <h2 className="text-2xl font-bold mb-4 text-[#09d1e3]">Admin Announcements and Updates</h2>
          <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-[#0e1550] text-white">
              <tr>
                <th className="py-2 px-4">Title</th>
                <th className="py-2 px-4">Content Type</th>
                <th className="py-2 px-4">Timestamp</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminContents.length > 0 ? (
                adminContents.map((content) => (
                  <tr key={content.id} className="border-b">
                    <td className="py-2 px-4">{content.title}</td>
                    <td className="py-2 px-4">{content.contentType}</td>
                    <td className="py-2 px-4">{new Date(content.timestamp).toLocaleString()}</td>
                    <td className="py-2 px-4">
                      <button
                        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                        onClick={() => handleViewClick(content)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4">No announcements or updates for admins.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

 {/* Admin Content Table Section */}
 {isDialogOpen && selectedContent && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 p-4">
    <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-2xl relative max-h-[80vh] overflow-y-auto">
      {/* Dialog Title */}
      <h2 className="text-xl font-semibold mb-4 text-[#09d1e3] text-center">
        Content Details
      </h2>

      {/* Content Details */}
      <div className="grid grid-cols-1 gap-4 text-sm">
        {/* Title */}
        <div className="flex flex-col items-start">
          <div className="flex items-center">
            <i className="fas fa-heading mr-2 text-gray-700"></i>
            <p className="font-semibold text-gray-700">Title:</p>
          </div>
          <p className="my-0  text-gray-600">{selectedContent.title}</p>
        </div>

        {/* Message */}
        <div className="flex flex-col items-start col-span-2">
          <div className="flex items-center">
            <i className="fas fa-comment mr-2 text-gray-700"></i>
            <p className="font-semibold text-gray-700">Message:</p>
          </div>
          <p className="my-0 text-gray-600">{selectedContent.message}</p>
        </div>

        {/* Content Type, Channel, Audience */}
        <div className="grid grid-cols-3 gap-4">
          {/* Content Type */}
          <div className="flex flex-col items-start bg-yellow-100 p-3 rounded-lg shadow-sm">
            <div className="flex items-center">
              <i className="fas fa-tag mr-2 text-gray-700"></i>
              <p className="font-semibold text-gray-700">Content Type</p>
            </div>
            <p className="text-gray-600">{selectedContent.contentType}</p>
          </div>

          {/* Channel */}
          <div className="flex flex-col items-start bg-yellow-100 p-3 rounded-lg shadow-sm">
            <div className="flex items-center">
              <i className="fas fa-bullhorn mr-2 text-gray-700"></i>
              <p className="font-semibold text-gray-700">Channel</p>
            </div>
            <p className="text-gray-600">{selectedContent.channel}</p>
          </div>

          {/* Audience */}
          <div className="flex flex-col items-start bg-yellow-100 p-3 rounded-lg shadow-sm">
            <div className="flex items-center">
              <i className="fas fa-users mr-2 text-gray-700"></i>
              <p className="font-semibold text-gray-700">Audience</p>
            </div>
            <p className="text-gray-600">{selectedContent.audience}</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t-2 border-gray-200 my-4"></div>

{/* User Info Section */}
<div className="space-y-2 text-sm">
  {/* Card Wrapper */}
  <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
    {/* Grid Layout for 2 columns */}
    <div className="grid grid-cols-2 gap-4">
      {/* User Name */}
      <div className="flex flex-col items-start">
        <div className="flex items-center">
          <i className="fas fa-user mr-2 text-gray-700"></i>
          <p className="font-semibold text-gray-700">User Name</p>
        </div>
        <p className="text-gray-600">{selectedContent.userName}</p>
      </div>

      {/* User Email */}
      <div className="flex flex-col items-start">
        <div className="flex items-center">
          <i className="fas fa-envelope mr-2 text-gray-700"></i>
          <p className="font-semibold text-gray-700">User Email</p>
        </div>
        <p className="text-gray-600">{selectedContent.userEmail}</p>
      </div>
    </div>
  </div>
</div>



      {/* Close Button */}
      <div className="mt-6 text-center">
        <button
          className="w-full px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition ease-in-out duration-150"
          onClick={handleCloseDialog}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}




      </div>
    </div>



      </div>
    </div>
  );
};

export default Home;

