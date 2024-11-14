import React, { useEffect, useState } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const AccessCheck = ({ requiredAccess, uid, children }) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [showAccessMessage, setShowAccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAccess = async () => {
    
      const db = getDatabase();
      const userRef = ref(db, `admins/${uid}`);

      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          const access = userData.access || ""; // Get access property

         
          console.log("UID:", uid);

          // Log the access property to console for debugging
          console.log("User access:", access);

          // Split access into an array using the comma as a delimiter
          const accessArray = access.split(", ").map(item => item.trim());
          console.log("User access split:", accessArray);

          // Check if the user's access includes the requiredAccess
          setHasAccess(accessArray.includes(requiredAccess));

          if (!accessArray.includes(requiredAccess)) {
            setShowAccessMessage(true);
          }
        } else {
          console.log("DATA NOT FOUND");
        }
      } catch (error) {
        console.error("Error fetching user access:", error);
      }
      setIsLoading(false); // Set loading to false after checks
    };

    checkUserAccess();
  }, [requiredAccess, uid, navigate]);

  const handleAccessMessageRedirect = () => {
    setShowAccessMessage(false);
    navigate("/home"); // Redirect to home
  };

  

  return (
    <>
      {showAccessMessage ? (
        <div className="flex items-center justify-center flex-grow bg-gray-200 w-full h-full absolute top-0 left-0">
          <div className="bg-red-100 border border-red-400 text-red-700 p-8 rounded-lg shadow-lg max-w-lg w-full">
            <strong className="font-bold text-xl">Access Denied!</strong>
            <p className="block text-lg">
              You do not have access to this feature. Please contact your SuperAdmin if you wish to grant access.
            </p>
            <div className="mt-6">
              <button
                onClick={handleAccessMessageRedirect}
                className="bg-[#09d1e3] text-white px-6 py-3 rounded-lg hover:bg-[#07a8c4] transition"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      ) : hasAccess ? (
        <>{children}</> // Render child components if access is granted
      ) : null}
    </>
  );
};

export default AccessCheck;
