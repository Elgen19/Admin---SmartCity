import React, { useState, useEffect } from "react";
import {
  getDatabase,
  ref,
  push,
  onValue,
  set,
  remove,
  get,
} from "firebase/database"; // Firebase import for Realtime DB
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import adminImage from "../assets/images/Smart city (1) 2.png";
import users from "../assets/images/Users.png";
import profile from "../assets/images/profile.png";
import feedback from "../assets/images/feedback.png";
import content from "../assets/images/content.png";
import activeContent from "../assets/images/active_content.png";
import home from "../assets/images/home.png";
import editIcon from "../assets/images/edit.png";
import deleteIcon from "../assets/images/delete.png";
import sendIcon from "../assets/images/send.png";

const ContentManagement = () => {
  const [activeLink, setActiveLink] = useState("/content-management");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setErrors] = useState(null);
  const [showAlert, setShowAlert] = useState(false); // State for alert dialog
  const [contentList, setContentList] = useState([]); // State to hold fetched content
  const [showAll, setShowAll] = useState(false); // New state for showing all content
  const [editingId, setEditingId] = useState(null);
  const [showAccessMessage, setShowAccessMessage] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    audience: "users",
    contentType: "",
    channel: "", // New field for channel
  });

  const navigate = useNavigate();
  const auth = getAuth()

  // Fetch data from Firebase on component mount
  useEffect(() => {
    const db = getDatabase();
    const contentsRef = ref(db, "Contents");
    const unsubscribe = onValue(contentsRef, (snapshot) => {
      const data = snapshot.val();
      const contents = [];
      for (let id in data) {
        contents.push({ id, ...data[id] }); // Push content with id
      }
      setContentList(contents); // Update state with fetched content
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
      } else {
        setCurrentUser({
          name: user.displayName || "Anonymous",
          email: user.email,
        });
        await checkUserAccess(user.uid); // Check user access
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
        setHasAccess(access.includes("CONTENT_MANAGEMENT")); // Check for CONTENT_MANAGEMENT access
        if (!access.includes("CONTENT_MANAGEMENT")) {
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

  const handleEditClick = async (content) => {
    setEditingId(content.id); // Set the ID of the content to edit
    setFormData({
      title: content.title,
      message: content.message,
      audience: content.audience || "users",
      contentType: content.contentType,
      channel: content.channel,
    });
    setIsFormOpen(true); // Open the form for editing

     // Log the admin activity after sending the invite
   

  };

  const handleSendClick = (content) => {
    // Normalize the channel to lowercase for comparison
    const normalizedChannel = content.channel.toLowerCase();

    if (normalizedChannel === "email") {
      // Send email notification
      fetch("http://localhost:5000/api/sender/send-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: content.title,
          message: content.message,
          audience: content.audience,
          channel: content.channel,
          sender: currentUser.email, // Add current user's email as the sender
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message) {
            console.log(data.message); // Show success message from response
            setShowAlert(true); // Show alert or other notification
          } else {
            const auth = getAuth();
     console.error(
              "Failed to send content: No message returned from the server."
            );
          }
        })
        .catch((error) => {
          console.error("Error sending content:", error);
        });
    } else if (normalizedChannel === "in-app") {
      // Send in-app notification only if the audience is admins
      if (content.audience.toLowerCase() === "admins") {
        // Send in-app notification to admins
        const db = getDatabase();
        const notificationsRef = ref(db, "AdminNotifications"); // Reference to AdminNotifications node

        const newNotification = {
          title: content.title,
          message: content.message,
          audience: content.audience,
          timestamp: Date.now(), // Add timestamp for ordering notifications
          sender: currentUser.email,
        };

        // Push the new notification to Firebase Realtime Database
        push(notificationsRef, newNotification) // Use push() to create a new entry
          .then(() => {
            console.log("In-app notification sent to admins successfully.");
            setShowAlert(true); // Display an alert or confirmation
          })
          .catch((error) => {
            console.error("Error sending in-app notification:", error);
          });
      } else {
        console.error(
          "Invalid audience. Only admins are supported for in-app notifications."
        );
      }
    } else {
      console.error(
        "Invalid channel. Only email and in-app channels are supported."
      );
    }
  };

  const navLinks = [
    { link: "/home", icon: home, label: "Home" },
    { link: "/profile", icon: profile, label: "Admin Profile" },
    { link: "/user-management", icon: users, label: "User Management" },
    { link: "/feedback-management", icon: feedback, label: "Feedbacks" },
    { link: "/content-management", icon: content, label: "Contents" },
  ];

  const handleLogout = () => {
    navigate("/");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title cannot be empty";
    if (!formData.message.trim()) newErrors.message = "Message cannot be empty";
    if (formData.contentType === "" || formData.contentType === "Select Type")
      newErrors.contentType = "Please select a valid content type";
    if (formData.channel === "" || formData.channel === "Select Channel")
      newErrors.channel = "Please select a valid channel";
    return newErrors;
  };

  const handleSubmit = () => {
    // Validate form data
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // Prevent submission if there are validation errors
    }

    // Get current user information
    const currentUser = getAuth().currentUser;

    if (editingId) {
      // Update existing content
      const updatedContent = {
        title: formData.title,
        message: formData.message,
        audience: formData.audience,
        contentType: formData.contentType,
        channel: formData.channel,
        userName: currentUser.displayName, // Add current user name
        userEmail: currentUser.email, // Add current user email
        timestamp: Date.now(), // Use current timestamp for updated records
      };

      // Update the content in Firebase using set()
      const contentRef = ref(getDatabase(), `Contents/${editingId}`);
      set(contentRef, updatedContent) // Use set instead of push
        .then(() => {
          setShowAlert(true); // Show success alert
          setIsFormOpen(false); // Close the form
          setEditingId(null); // Reset editingId
          // Optionally, fetch updated contents if needed
        })
        .catch((error) => {
          console.error("Error updating content: ", error);
        });
    } else {
      // Create new content
      const newContent = {
        title: formData.title,
        message: formData.message,
        audience: formData.audience,
        contentType: formData.contentType,
        channel: formData.channel,
        userName: currentUser.displayName, // Add current user name
        userEmail: currentUser.email, // Add current user email
        timestamp: Date.now(), // Use current timestamp for new records
      };

      // Push new content to Firebase
      const contentsRef = ref(getDatabase(), "Contents");
      push(contentsRef, newContent)
        .then(() => {
          setShowAlert(true); // Show success alert
          setIsFormOpen(false); // Close the form
          // Optionally, fetch updated contents if needed
        })
        .catch((error) => {
          console.error("Error creating content: ", error);
        });
    }
  };

  const handleDeleteClick = (contentId) => {
    // Confirm before deleting
    if (window.confirm("Are you sure you want to delete this content?")) {
      const contentRef = ref(getDatabase(), `Contents/${contentId}`);
      remove(contentRef)
        .then(() => {
          console.log("Content deleted successfully");
          // Optionally, update the content list if needed
        })
        .catch((error) => {
          console.error("Error deleting content: ", error);
        });
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
              You do not have access to manage content. Contact your SuperAdmin if you need access.
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
        <div className="w-1/4 bg-gradient-to-b from-[#0e1550] to-[#1f2fb6] p-6 flex flex-col overflow-hidden">
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
                  src={activeLink === link ? activeContent : icon}
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
          <h1 className="text-2xl font-bold mb-2 text-[#09d1e3]">
            Content Management
          </h1>
          <p className="text-gray-700 mb-4">
            Create and manage content for your audience.
          </p>

          {/* Create Content Card */}
          <div
            className="bg-[#f1f9ff] shadow-md rounded-lg p-4 mb-6 cursor-pointer hover:shadow-lg transition"
            onClick={() => setIsFormOpen(!isFormOpen)}
          >
            <h2 className="text-xl font-semibold text-[#09d1e3]">
              Create Content
            </h2>
            <p className="text-gray-500 text-sm">
              Click here to create a new announcement, update, or reminder for
              your audience.
            </p>
          </div>

          {isFormOpen && (
            <form
              className="bg-blue-50 p-6 rounded-lg shadow-md w-full max-w-md mx-auto"
              onSubmit={handleSubmit}
            >
              {/* Form Fields */}
              <label className="block mb-2">
                Title
                <input
                  type="text"
                  className="block w-full mt-1 py-2 border border-gray-300 rounded focus:border-[#09d1e3] focus:outline-none"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </label>

              <label className="block mb-2">
                Message
                <textarea
                  className="block w-full h-32 mt-1 py-2 border border-gray-300 rounded resize-none focus:border-[#09d1e3] focus:outline-none"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                />
              </label>

              <label className="block mb-2">
                Audience
                <select
                  className="block w-full mt-1 p-2 border border-gray-300 rounded focus:border-[#09d1e3] focus:outline-none"
                  value={formData.audience}
                  onChange={(e) =>
                    setFormData({ ...formData, audience: e.target.value })
                  }
                >
                  <option value="users">Users</option>
                  <option value="admins">Admins</option>
                  <option value="both">Both</option>
                </select>
              </label>

              <label className="block mb-2">
                Content Type
                <select
                  className="block w-full mt-1 p-2 border border-gray-300 rounded focus:border-[#09d1e3] focus:outline-none"
                  value={formData.contentType}
                  onChange={(e) =>
                    setFormData({ ...formData, contentType: e.target.value })
                  }
                  required
                >
                  <option value="">Select Type</option>
                  <option value="announcement">Announcement</option>
                  <option value="update">Update</option>
                  <option value="reminder">Reminder</option>
                </select>
              </label>

              <label className="block mb-2">
                Channel
                <select
                  className="block w-full mt-1 p-2 border border-gray-300 rounded focus:border-[#09d1e3] focus:outline-none"
                  value={formData.channel}
                  onChange={(e) =>
                    setFormData({ ...formData, channel: e.target.value })
                  }
                  required
                >
                  <option value="">Select Channel</option>
                  <option value="email">Email</option>
                  <option value="in-app">In-app</option>
                </select>
              </label>

              <button
                type="submit"
                className="w-full h-12 bg-blue-600 text-white font-semibold rounded-lg mt-4 hover:bg-blue-500 transition"
              >
                Submit
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData({
                    title: "",
                    message: "",
                    audience: "users",
                    contentType: "",
                    channel: "",
                  }); // Reset form data to initial state
                  setIsFormOpen(false); // Close the form
                }}
                className="w-full h-12 bg-gray-400 text-white font-semibold rounded-lg mt-2 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </form>
          )}

          {/* Alert Dialog */}
          {showAlert && (
            <div className="w-full max-w-md mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold text-green-600">
                  Success!
                </h2>
                <p className="text-gray-700">
                  Your content has been successfully saved.
                </p>
                <button
                  onClick={() => setShowAlert(false)}
                  className="mt-4 w-full h-10 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Display Saved Content */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-[#09d1e3] mb-4">
              Saved Content
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {contentList.length === 0 ? (
                <div className="bg-blue-100 shadow-md rounded-lg p-4 text-center">
                  <h3 className="font-semibold text-lg">
                    No Contents Available
                  </h3>
                  <p className="text-sm text-gray-500">
                    There are currently no saved contents. Please add some
                    content.
                  </p>
                </div>
              ) : (
                contentList
                  .slice(0, showAll ? contentList.length : 2)
                  .map((content) => (
                    <div
                      key={content.timestamp}
                      className="bg-yellow-100 shadow-md rounded-lg p-4 hover:bg-green-100 transition-colors duration-200 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-semibold text-xl">
                          {content.title}
                        </h3>
                        <p className="text-sm">{content.message}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                          <span className="material-icons text-base mr-1">
                            person
                          </span>
                          <p>
                            Posted by: {content.userName} ({content.userEmail})
                          </p>
                          <span className="material-icons text-base mx-2">
                            access_time
                          </span>
                          <p>
                            Timestamp:{" "}
                            {new Date(content.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {/* Icons Container */}
                      <div className="flex space-x-2">
                        {/* Edit Icon */}
                        <img
                          src={editIcon}
                          alt="Edit"
                          className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => handleEditClick(content)} // Call the handleEditClick function
                        />

                        {/* Delete Icon */}
                        <img
                          src={deleteIcon}
                          alt="Delete"
                          className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => handleDeleteClick(content.id)} // Pass content ID for deletion
                        />

                        {/* Send Icon */}
                        <img
                          src={sendIcon}
                          alt="Send"
                          className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => handleSendClick(content)} // Trigger the send action
                        />
                      </div>
                    </div>
                  ))
              )}
            </div>

            {contentList.length > 2 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="mt-4 w-full h-10 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition"
              >
                {showAll ? "Show Less" : "See All"}
              </button>
            )}
          </div>
        </div>
      </div> )}
    </>
  );
};

export default ContentManagement;
