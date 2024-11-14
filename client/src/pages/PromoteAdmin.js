import { useEffect, useState } from 'react';
import { getDatabase, ref, get, update, set } from 'firebase/database';
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import CustomConfirmAlert from '../components/CustomConfirmAlert';
import Lottie from 'lottie-react'
import animationData from '../assets/lottifies/promote_admin.json';
import HeaderCards from '../components/HeaderCards.js';

const PromoteAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [currentAdminToPromote, setCurrentAdminToPromote] = useState(null);
  const navigate = useNavigate();
  const [updateMessage, setUpdateMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAccessMessage, setShowAccessMessage] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        await checkUserAccess(user.uid);
      } else {
        setIsAuthenticated(false);
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const checkUserAccess = async (uid) => {
    const db = getDatabase();
    const userRef = ref(db, `admins/${uid}`);

    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const access = userData.access || "";
        setHasAccess(access.includes("PROMOTE_ADMIN"));
        if (!access.includes("PROMOTE_ADMIN")) {
          setShowAccessMessage(true);
        }
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.error("Error fetching user access:", error);
      navigate("/");
    }
  };

  const handleAccessMessageRedirect = () => {
    navigate('/home'); // Redirect to home or desired page when access is denied
  };

  useEffect(() => {
    const fetchAdmins = async () => {
      const db = getDatabase();
      const dbRef = ref(db, 'admins');

      try {
        const snapshot = await get(dbRef);
        const data = snapshot.val();

        if (data) {
          const adminsArray = Object.keys(data)
            .filter(key => data[key].role !== 'SuperAdmin')
            .map(key => ({
              id: key,
              ...data[key]
            }));

          setAdmins(adminsArray);
        }
      } catch (error) {
        console.error("Error fetching admins:", error);
      }
    };

    fetchAdmins();
  }, []);

  const handlePromote = (adminId) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser && currentUser.uid) {
      setCurrentAdminToPromote({ adminId, promotingAdminId: currentUser.uid });
      setShowConfirmAlert(true);
    } else {
      alert('You need to be logged in as an admin to perform this operation.');
    }
  };

  const promoteAdmin = async () => {
    const { adminId, promotingAdminId } = currentAdminToPromote;

    try {
      const db = getDatabase();
      const adminRef = ref(db, 'admins');
      const adminToPromoteRef = ref(db, `admins/${adminId}`);
      const promotingAdminRef = ref(db, `admins/${promotingAdminId}`);

      const adminToPromoteSnapshot = await get(adminToPromoteRef);
      const promotingAdminSnapshot = await get(promotingAdminRef);

      if (!adminToPromoteSnapshot.exists() || !promotingAdminSnapshot.exists()) {
        throw new Error('One or both admin data does not exist.');
      }

      await update(adminToPromoteRef, {
        role: 'SuperAdmin',
        access: 'FEEDBACK_MANAGEMENT, HOME, CONTENT_MANAGEMENT, NOTIFICATIONS, ADMIN_PROFILE, INVITE_NEW_ADMIN, APPROVE_DENY_ADMIN_REGISTRATION, VIEW_USER_INFORMATION, UPDATE_ADMIN_ACCESS, ADMIN_ACTIVITY_LOGS, ACTIVATE_DEACTIVATE_ACCOUNTS, PROMOTE_ADMIN'
      });

      await set(promotingAdminRef, {
        ...promotingAdminSnapshot.val(),
        role: 'admin',
        access: 'FEEDBACK_MANAGEMENT, HOME, CONTENT_MANAGEMENT, NOTIFICATIONS, ADMIN_PROFILE'
      });

      alert('Admin promoted successfully!');
      navigate('/user-management');
    } catch (error) {
      console.error('Error promoting admin:', error);
      alert(`An error occurred while promoting the admin. Details: ${error.message}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto font-nunito">
      {showAccessMessage ? (
        <div className="flex items-center justify-center h-screen bg-gray-200">
          <div className="bg-red-100 border border-red-400 text-red-700 p-6 rounded-lg shadow-lg max-w-md w-full">
            <strong className="font-bold text-lg">Access Denied!</strong>
            <p className="block">
              You do not have access to view or edit profile. Contact your SuperAdmin if you need access.
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
        <>
        <HeaderCards
        title="Admin Promotion"
        description="Promote an admin to Super Admin. Please note that once you promote an admin, your role will be downgraded from SuperAdmin to Admin and will lose access to key resources."
        animationData={animationData}/>

<table className="mt-5 min-w-full bg-white border border-white-300 px-3">
<thead className="bg-[#09d1e3] text-white">
              <tr>
                <th className="p-4 border-b text-left">Name</th>
                <th className="p-4 border-b text-left">Email</th>
                <th className="p-4 border-b text-left">Role</th>
                <th className="p-4 border-b text-left">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {admins.map((admin, index) => (
                <tr
                  key={admin.id}
                  className={`${index % 2 === 0 ? 'bg-yellow-100' : 'bg-white'} hover:bg-yellow-200 transition-colors`}
                >
                  <td className="p-4 border-b">{admin.name}</td>
                  <td className="p-4 border-b">{admin.email}</td>
                  <td className="p-4 border-b">{admin.role}</td>
                  <td className="p-4 border-b">
                    <button
                      onClick={() => handlePromote(admin.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-red-400 transition"
                    >
                      Promote
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {showConfirmAlert && (
            <CustomConfirmAlert
              message="Are you sure you want to promote this admin? This will also demote your role."
              onConfirm={async () => {
                await promoteAdmin();
                setShowConfirmAlert(false);
              }}
              onCancel={() => setShowConfirmAlert(false)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default PromoteAdmin;
