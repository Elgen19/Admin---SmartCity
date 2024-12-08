import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignIn from './pages/SignIn';
import Invite from './pages/Invite';
import Signup from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';
import Notification from './pages/Notifications';
import FeedbackManagement from './pages/FeedbackManagement';
import ContentManagement from './pages/ContentManagement';
import ApproveDenyAdmin from './pages/ApproveDenyAdmin';
import UpdateAdminAccess from './pages/UpdateAdminAccess';
import ActivateDeactivateAccount from './pages/ActivateDeactivateAccount';
import ActivityLogs from './pages/ActivityLogs';
import PromoteAdmin from './pages/PromoteAdmin';
import TaskManagement from './pages/TaskManagement';

import './styles/tailwind.css'


function App() {
  return (
    <Router>
      <Routes>
     
        <Route path="/" element={<SignIn />} />
        <Route path="/invite" element={<Invite />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/notification" element={<Notification />} />
        <Route path="/feedback-management" element={<FeedbackManagement />} />
        <Route path="/content-management" element={<ContentManagement />} />
        <Route path="/approve-deny-admins" element={<ApproveDenyAdmin />} />
        <Route path="/update-admin-permission" element={<UpdateAdminAccess />} />
        <Route path="/activate-deactivate-account" element={<ActivateDeactivateAccount />} />
        <Route path="/admin-activity-logs" element={<ActivityLogs />} />
        <Route path="/promote-admin" element={<PromoteAdmin />} />
        <Route path="/task-management" element={<TaskManagement />} />


        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;
