import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import adminImage from "../assets/images/Smart city (1) 2.png";
import users from "../assets/images/Users.png";
import profile from "../assets/images/profile.png";
import feedback from "../assets/images/feedback.png";
import content from "../assets/images/content.png";
import home from "../assets/images/home.png";
import activeFeedback from "../assets/images/active_feedback.png";
import Lottie from 'lottie-react'
import animationData from '../assets/lottifies/feeback.json';
import HeaderCards from '../components/HeaderCards.js';

const FeedbackManagement = () => {
  const [activeLink, setActiveLink] = useState("/feedback-management");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [positiveFeedbacks, setPositiveFeedbacks] = useState([]);
  const [negativeFeedbacks, setNegativeFeedbacks] = useState([]);
  const [showAllPositive, setShowAllPositive] = useState(false);
  const [showAllNegative, setShowAllNegative] = useState(false);
  const [ratingStats, setRatingStats] = useState({
    highestRating: 0,
    lowestRating: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [positiveFeedbackSummary, setPositiveFeedbackSummary] = useState("");
  const [negativeFeedbackSummary, setNegativeFeedbackSummary] = useState("");
  const [bugReportSummary, setBugReportSummary] = useState("");
  const [featureSuggestionSummary, setFeatureSuggestionSummary] = useState("");
  const [generalFeedbackSummary, setGeneralFeedbackSummary] = useState("");
  const [error, setError] = useState(null);
  const [showAccessMessage, setShowAccessMessage] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  const BASE_URL = "https://smartcity-backend.vercel.app";

  // Function to fetch feedback summary for a given tone
  const fetchFeedbackSummary = async (tone, setSummaryState) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/tone/analyze-feedback-tone`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tone }), // Sending tone in the request body
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching ${tone} summary: ${response.statusText}`
        );
      }

      const data = await response.json();
      setSummaryState(data.analysis); // Set the analysis from the response
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  // Fetch both feedback summaries when the component mounts
  useEffect(() => {
    fetchFeedbackSummary("Positive Feedback", setPositiveFeedbackSummary);
    fetchFeedbackSummary("Negative Feedback", setNegativeFeedbackSummary);
  }, []);

  const fetchCommentAnalysis = async () => {
    try {
      const requests = [
        axios.post(`${BASE_URL}/api/type/analyze-feedback-type`, {
          type: "Bug Report",
        }),
        axios.post(`${BASE_URL}/api/type/analyze-feedback-type`, {
          type: "Feature Suggestion",
        }),
        axios.post(`${BASE_URL}/api/type/analyze-feedback-type`, {
          type: "General Feedback",
        }),
      ];
      const responses = await Promise.all(
        requests.map((req) => req.catch((err) => err))
      );

      responses.forEach((response, index) => {
        if (response instanceof Error) {
          const errorMessage =
            response.response?.data?.error ||
            "Failed to fetch feedback summary.";
          switch (index) {
            case 0:
              setBugReportSummary(
                errorMessage.includes("No feedback comments available")
                  ? "No comments available for Bug Reports."
                  : errorMessage
              );
              break;
            case 1:
              setFeatureSuggestionSummary(
                errorMessage.includes("No feedback comments available")
                  ? "No comments available for Feature Suggestions."
                  : errorMessage
              );
              break;
            case 2:
              setGeneralFeedbackSummary(
                errorMessage.includes("No feedback comments available")
                  ? "No comments available for General Feedback."
                  : errorMessage
              );
              break;
            default:
              break;
          }
        } else {
          switch (index) {
            case 0:
              setBugReportSummary(response.data.analysis);
              break;
            case 1:
              setFeatureSuggestionSummary(response.data.analysis);
              break;
            case 2:
              setGeneralFeedbackSummary(response.data.analysis);
              break;
            default:
              break;
          }
        }
      });
    } catch (err) {
      setError("Failed to fetch feedback summaries.");
    }
  };

  useEffect(() => {
    fetchCommentAnalysis();
  }, []);

  // Function to calculate rating distribution
  const calculateRatingDistribution = (feedbacks) => {
    const distribution = Array(5).fill(0);

    feedbacks.forEach((feedback) => {
      if (feedback.rating >= 1 && feedback.rating <= 5) {
        distribution[feedback.rating - 1]++;
      }
    });

    return distribution.map((count, index) => ({
      rating: index + 1,
      count,
    }));
  };

  // Calculate distributions
  const positiveDistribution = calculateRatingDistribution(positiveFeedbacks);
  const negativeDistribution = calculateRatingDistribution(negativeFeedbacks);

  const combinedDistribution = [
    {
      rating: 1,
      positiveCount: positiveDistribution[0].count,
      negativeCount: negativeDistribution[0].count,
    },
    {
      rating: 2,
      positiveCount: positiveDistribution[1].count,
      negativeCount: negativeDistribution[1].count,
    },
    {
      rating: 3,
      positiveCount: positiveDistribution[2].count,
      negativeCount: negativeDistribution[2].count,
    },
    {
      rating: 4,
      positiveCount: positiveDistribution[3].count,
      negativeCount: negativeDistribution[3].count,
    },
    {
      rating: 5,
      positiveCount: positiveDistribution[4].count,
      negativeCount: negativeDistribution[4].count,
    },
  ];
  const ratings = combinedDistribution.map((item) => item.rating);

  const navLinks = [
    { link: "/home", icon: home, label: "Home" },
    { link: "/profile", icon: profile, label: "Admin Profile" },
    { link: "/user-management", icon: users, label: "User Management" },
    { link: "/feedback-management", icon: feedback, label: "Feedbacks" },
    { link: "/content-management", icon: content, label: "Contents" },
  ];
  useEffect(() => {
    const fetchRatingStats = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/rating/get-ratings`);
        setRatingStats(response.data);
      } catch (error) {
        // Check if it's a 404 error
        if (error.response && error.response.status === 404) {
          console.error("Endpoint not found (404):", error.response.data);
          setError("Rating statistics not found.");
        } else {
          console.error("An error occurred while fetching rating stats:", error);
          setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchRatingStats();
  }, []);
  

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        await checkUserAccess(user.uid); // Check user access
      } else {
        setIsAuthenticated(false);
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const checkUserAccess = async (uid) => {
    const db = getDatabase();
    const userRef = ref(db, `admins/${uid}`); // Fetch the user's data based on uid

    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const access = userData.access || ""; // Get access property
        setHasAccess(access.includes("FEEDBACK_MANAGEMENT")); // Check for FEEDBACK_MANAGEMENT access
        if (!access.includes("FEEDBACK_MANAGEMENT")) {
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


  // Fetch feedbacks from Firebase
  useEffect(() => {
    const db = getDatabase();
    const feedbackRef = ref(db, "Feedback");

    get(feedbackRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const feedbackData = snapshot.val();
          classifyFeedbacks(feedbackData);
        } else {
          console.log("No feedback data available.");
        }
      })
      .catch((error) => {
        console.error("Error fetching feedback data:", error);
      });
  }, []);

  // Classify feedbacks into positive and negative
  const classifyFeedbacks = (feedbackData) => {
    const positive = [];
    const negative = [];

    for (const key in feedbackData) {
      if (feedbackData[key].tone === "Positive Feedback") {
        positive.push(feedbackData[key]);
      } else if (feedbackData[key].tone === "Negative Feedback") {
        negative.push(feedbackData[key]);
      }
    }

    setPositiveFeedbacks(positive);
    setNegativeFeedbacks(negative);
  };

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

  // Function to render feedbacks (limited to 3 or all based on state)
  const renderFeedbacks = (feedbacks, showAll) => {
    return showAll ? feedbacks : feedbacks.slice(0, 3);
  };

  const handleAccessMessageRedirect = () => {
    setShowAccessMessage(false);
    navigate("/home"); // Redirect to home
  };

  return (
    <>
    {showAccessMessage ? (
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
                  src={activeLink === link ? activeFeedback : icon} // Use active icon if link is active
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

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-start justify-start p-10 overflow-auto">
        <HeaderCards
        title="Feedbacks"
        description="Explore user feedback, including positive and negative reviews, to
            gain insights and enhance user satisfaction."
        animationData={animationData}
      />
        

          {/* Positive Feedbacks Section */}
          {!showAllNegative && (
            <>
              <div className="flex flex-col items-start justify-between w-full mt-6 mb-0 leading-tight">
                <div className="flex items-center justify-between w-full">
                  <h2 className="text-3xl font-bold text-green-700 tracking-tight">
                    Positive Feedbacks
                  </h2>
                  {!showAllPositive && (
                    <button
                      onClick={() => setShowAllPositive(true)}
                      className="text-blue-500 hover:text-blue-700 font-semibold transition-colors border-0 bg-transparent"
                    >
                      See All
                    </button>
                  )}
                </div>
              </div>

              <div
                className={`grid gap-6 ${
                  showAllPositive ? "grid-cols-1" : "grid-cols-3"
                } w-full max-w-6xl mx-auto`}
              >
                {renderFeedbacks(positiveFeedbacks, showAllPositive).map(
                  (feedback, index) => (
                    <div
                      key={index}
                      className={`p-4 border rounded bg-green-100 ${
                        showAllPositive ? "w-full" : "w-auto"
                      } 
                    ${
                      !showAllPositive
                        ? "transition-transform transform hover:scale-105 shadow-lg"
                        : ""
                    } flex items-start`}
                    >
                      <img
                        src={feedback.profilePic}
                        alt="Profile"
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {feedback.name}
                        </p>
                        <p className="text-lg font-medium text-gray-700 italic">
                          "{feedback.comment}"
                        </p>
                        <div className="flex items-center mt-2">
                          {Array.from({ length: 5 }, (_, i) => (
                            <svg
                              key={i}
                              className={`w-5 h-5 ${
                                i < feedback.rating
                                  ? "text-yellow-500"
                                  : "text-gray-400"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M10 15.27L16.18 19l-1.64-7.03L19 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
              {showAllPositive && (
                <button
                  onClick={() => setShowAllPositive(false)}
                  className="text-blue-500 hover:text-blue-700 font-semibold transition-colors border-0 bg-transparent mt-4"
                >
                  Show Less
                </button>
              )}
            </>
          )}

          {/* Negative Feedbacks Section */}
          {!showAllPositive && (
            <>
              <div className="flex flex-col items-start justify-between w-full mt-6 mb-0 leading-tight">
                <div className="flex items-center justify-between w-full">
                  <h2 className="text-3xl font-bold text-red-700 tracking-tight">
                    Negative Feedbacks
                  </h2>
                  {!showAllNegative && (
                    <button
                      onClick={() => setShowAllNegative(true)}
                      className="text-blue-500 hover:text-blue-700 font-semibold transition-colors border-0 bg-transparent"
                    >
                      See All
                    </button>
                  )}
                </div>
              </div>

              <div
                className={`grid gap-6 ${
                  showAllNegative ? "grid-cols-1" : "grid-cols-3"
                } w-full max-w-6xl mx-auto`}
              >
                {renderFeedbacks(negativeFeedbacks, showAllNegative).map(
                  (feedback, index) => (
                    <div
                      key={index}
                      className={`p-4 border rounded bg-red-100 ${
                        showAllNegative ? "w-full" : "w-auto"
                      } 
                    ${
                      !showAllNegative
                        ? "transition-transform transform hover:scale-105 shadow-lg"
                        : ""
                    } flex items-start`}
                    >
                      <img
                        src={feedback.profilePic}
                        alt="Profile"
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {feedback.name}
                        </p>
                        <p className="text-lg font-medium text-gray-700 italic">
                          "{feedback.comment}"
                        </p>
                        <div className="flex items-center mt-2">
                          {Array.from({ length: 5 }, (_, i) => (
                            <svg
                              key={i}
                              className={`w-5 h-5 ${
                                i < feedback.rating
                                  ? "text-yellow-500"
                                  : "text-gray-400"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M10 15.27L16.18 19l-1.64-7.03L19 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
              {showAllNegative && (
                <button
                  onClick={() => setShowAllNegative(false)}
                  className="text-blue-500 hover:text-blue-700 font-semibold transition-colors border-0 bg-transparent mt-4"
                >
                  Show Less
                </button>
              )}
            </>
          )}

          <div className="mt-8 flex justify-between">
            {/* Bar Chart for Feedback Ratings */}
            <div className="flex-1 mr-4">
              <h2 className="text-[#09d1e3] text-2xl font-bold">
                Feedback Ratings Distribution
              </h2>
              <BarChart
                width={600}
                height={300}
                data={combinedDistribution}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis
                  tickFormatter={(value) => Math.floor(value)}
                  domain={[0, "dataMax + 1"]} // Ensures it shows from 0 to max data value + 1
                  interval={0} // Ensure ticks are shown at every integer
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="positiveCount"
                  fill="#33803d"
                  name="Positive Feedback"
                />
                <Bar
                  dataKey="negativeCount"
                  fill="#b91c1c"
                  name="Negative Feedback"
                />
              </BarChart>
            </div>

            {/* Summary Card */}
            <div className="bg-white p-6 shadow-lg rounded-xl w-1/3 mx-auto my-8 transform transition-transform hover:scale-105 duration-300">
              <h3 className="text-[#09d1e3] text-2xl font-bold mb-4">
                Feedback Ratings Summary
              </h3>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : (
                <div>
                  <p className="text-gray-700">
                    The highest rating received is{" "}
                    <strong className="text-green-600">
                      {ratingStats.highestRating}
                    </strong>
                    , attributed to{" "}
                    <strong className="text-green-700">
                      {ratingStats.highestCount}
                    </strong>{" "}
                    respondent(s).
                  </p>
                  <p className="mt-4 text-gray-700">
                    Conversely, the lowest rating is{" "}
                    <strong className="text-red-600">
                      {ratingStats.lowestRating}
                    </strong>
                    , which reflects the opinions of{" "}
                    <strong className="text-red-700">
                      {ratingStats.lowestCount}
                    </strong>{" "}
                    individual(s).
                  </p>
                  <p className="mt-4 text-gray-700">
                    The average rating across all feedback is{" "}
                    <strong className="text-indigo-600">
                      {ratingStats.averageRating}
                    </strong>
                    , providing insight into overall user satisfaction and
                    experience.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-[#09d1e3] text-3xl font-bold text-center mb-6">
              Comment Analysis
            </h2>

            {/* Positive Feedback Card */}
            <div className="feedback-card bg-green-100 border border-green-400 p-4 mb-6 rounded-lg shadow-lg transform transition-transform hover:scale-105 duration-300">
              <h4 className="text-xl font-semibold text-green-700 mb-2">
                Summary Of All Positive Comments
              </h4>
              <p className="text-green-600">
                {positiveFeedbackSummary ||
                  "No positive feedbacks found."}
              </p>
            </div>

            {/* Negative Feedback Card */}
            <div className="feedback-card bg-red-100 border border-red-400 p-4 rounded-lg shadow-lg transform transition-transform hover:scale-105 duration-300">
              <h4 className="text-xl font-semibold text-red-700 mb-2">
                Summary Of All Negative Comments
              </h4>
              <p className="text-red-600">
                {negativeFeedbackSummary ||
                  "No negative feedbacks found."}
              </p>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-[#09d1e3] text-3xl font-bold text-center mb-6">
              Comment Analysis by Type
            </h2>

            {/* Bug Report Card */}
            <div className="feedback-card bg-blue-100 border border-blue-400 p-4 mb-6 rounded-lg shadow-lg transform transition-transform hover:scale-105 duration-300">
              <h4 className="text-xl font-semibold text-blue-700 mb-2">
                Summary Of All Bug Reports
              </h4>
              <p className="text-blue-600">
                {bugReportSummary || "Loading bug report summary..."}
              </p>
            </div>

            {/* Feature Suggestion Card */}
            <div className="feedback-card bg-yellow-100 border border-yellow-400 p-4 mb-6 rounded-lg shadow-lg transform transition-transform hover:scale-105 duration-300">
              <h4 className="text-xl font-semibold text-yellow-700 mb-2">
                Summary Of All Feature Suggestions
              </h4>
              <p className="text-yellow-600">
                {featureSuggestionSummary ||
                  "Loading feature suggestion summary..."}
              </p>
            </div>

            {/* General Feedback Card */}
            <div className="feedback-card bg-purple-100 border border-purple-400 p-4 rounded-lg shadow-lg transform transition-transform hover:scale-105 duration-300">
              <h4 className="text-xl font-semibold text-purple-700 mb-2">
                Summary Of All General Feedback
              </h4>
              <p className="text-purple-600">
                {generalFeedbackSummary ||
                  "Loading general feedback summary..."}
              </p>
            </div>
          </div>
        </div>
      </div> )}
    </>
  );
};

export default FeedbackManagement;
