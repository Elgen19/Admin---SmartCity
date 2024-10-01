import React, { useState, useEffect, useCallback } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get, child, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

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
  
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
        const response = await axios.get('http://localhost:5000/api/ai/analyze-feedback'); // Endpoint for analysis

        // Remove "Summary:" from the beginning of the response string
        const cleanAnalysis = response.data.analysis.replace(/^Summary:\s*/, '');
        setAnalysis(cleanAnalysis); // Set the cleaned analysis result

      } else if (reportType === 'Application Rating Overview') {
        // Fetch rating analysis report
        const response = await axios.get('http://localhost:5000/api/rating/get-ratings'); // Endpoint for ratings
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

    setGreeting(`${greetingMessage}, ${adminName.split(" ")[0]}!`);
  }, [adminName]);

  const navLinks = [
    { link: "/home", icon: home, label: "Home" },
    { link: "/profile", icon: profile, label: "Admin Profile" },
    { link: "/user-management", icon: users, label: "User Management" },
    { link: "/feedbacks", icon: feedback, label: "Feedbacks" },
    { link: "/contents", icon: content, label: "Contents" },
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
      <div className="w-1/4 bg-gradient-to-b from-[#0e1550] to-[#1f2fb6] p-6 flex flex-col">
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
              className={`flex items-center text-white text-xl hover:text-[#09d1e3] transition ${
                activeLink === link
                  ? "font-bold border-l-4 border-[#09d1e3] pl-3"
                  : ""
              }`}
              style={{ textDecoration: "none" }}
            >
              <img className="w-8 h-8 mr-3" src={icon} alt={`${label} Icon`} />
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
          <label className="text-2xl font-bold text-[#141d70]">
            {greeting}
          </label>
          <button className="ml-4 bg-transparent p-0 border-none">
            <img
              src={notificationBell}
              alt="Notification Bell"
              className="w-8 h-8"
            />
          </button>
        </div>

      

        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Users Card */}
          <div className="bg-[#1976d2] rounded-lg p-4 shadow-md transform transition duration-300 hover:scale-105">
            <p className="text-white text-xl font-bold mb-2">Total Users</p>
            <p className="text-white text-3xl">{userCount}</p>
          </div>

          {/* Feedback Card */}
          <div className="bg-[#0288d1] rounded-lg p-4 shadow-md transform transition duration-300 hover:scale-105">
            <p className="text-white text-xl font-bold mb-2">Feedback</p>
            <p className="text-white text-3xl">{feedbackCount}</p>
          </div>

          {/* Content Updates Card */}
          <div className="bg-[#03a9f4] rounded-lg p-4 shadow-md transform transition duration-300 hover:scale-105">
            <p className="text-white text-xl font-bold mb-2">Content Updates</p>
            <p className="text-white text-3xl">{contentUpdates}</p>
          </div>
        </div>

        {/* Dropdowns and Charts Section */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Dropdown for Time Frame Analysis */}
          <div className="flex flex-col w-full mb-4">
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
          <div className="flex flex-col w-full mb-4">
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
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-4">Active Users</h2>
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
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-4">Feedback Summary</h2>
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

        <div className="mt-6">
  {/* Outer Card */}
  <div className="bg-[#f9f9f9] p-6 rounded-lg shadow-md">
  <h2 className="text-2xl font-bold text-[#141d70] mb-2">Reports and Analysis</h2>



{/* Dropdown for Report Selection */}
<div className="flex flex-col mb-4">
  <label className="mb-1 text-sm font-medium text-[#141d70]">Select Report Type</label>
  <div className="inline-block">
    <select
      className="p-2 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={selectedReportForAnalysis}
      onChange={(e) => setSelectedReportAnalysis(e.target.value)}
    >
      <option value="Bug Analysis Report">Bug Analysis Report</option>
      <option value="Application Rating Overview">Application Rating Overview</option>
    </select>
  </div>
</div>


    {/* Analysis Display */}
    <h3 className="text-lg font-bold mb-2 text-[#141d70]">{selectedReportForAnalysis}</h3>
    {loading ? (
      <p className="text-gray-500">Analyzing comments...</p>
    ) : analysis ? (
      <p className="text-gray-700">{analysis}</p>
    ) : (
      <p className="text-gray-500">No analysis available.</p>
    )}
  </div>
</div>





      </div>
    </div>
  );
};

export default Home;
