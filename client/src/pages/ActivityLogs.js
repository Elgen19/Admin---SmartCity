import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import 'tailwindcss/tailwind.css';
import animationData from '../assets/lottifies/security_logs.json';
import HeaderCards from '../components/HeaderCards.js';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [adminNames, setAdminNames] = useState({});
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filter, setFilter] = useState({
    admin: '',
    action: '',
    page: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false); // State to manage filter visibility

  useEffect(() => {
    const db = getDatabase();

    // Fetch logs from the ActivityLogs node
    const logsRef = ref(db, 'ActivityLogs');
    onValue(logsRef, (snapshot) => {
      const logsData = snapshot.val();
      if (logsData) {
        const flattenedLogs = [];
        Object.keys(logsData).forEach((adminId) => {
          const adminLogs = logsData[adminId];
          Object.keys(adminLogs).forEach((logId) => {
            flattenedLogs.push({
              id: logId,
              adminId: adminId,
              ...adminLogs[logId],
            });
          });
        });
        setLogs(flattenedLogs);
        setFilteredLogs(flattenedLogs); // Initialize filtered logs
      }
    });

    // Fetch admin names from the admins node
    const adminsRef = ref(db, 'admins');
    onValue(adminsRef, (snapshot) => {
      const adminsData = snapshot.val();
      if (adminsData) {
        const names = Object.keys(adminsData).reduce((acc, adminId) => {
          acc[adminId] = adminsData[adminId].name; // Save the name of each admin
          return acc;
        }, {});
        setAdminNames(names);
      }
    });
  }, []);

  // Format the timestamp to display abbreviated month
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short', // Abbreviated month (e.g., OCT)
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Function to filter logs based on the selected filter
  const applyFilter = () => {
    setLoading(true); // Start loading state
    let filtered = logs;

    // Filter by admin name
    if (filter.admin) {
      filtered = filtered.filter(log => adminNames[log.adminId] === filter.admin);
    }

    // Filter by action (Extract first word from action)
    if (filter.action) {
      filtered = filtered.filter(log => log.action.split(' ')[0] === filter.action);
    }

    // Filter by page
    if (filter.page) {
      filtered = filtered.filter(log => log.page === filter.page);
    }

    // Filter by date range
    if (filter.startDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(filter.startDate));
    }
    if (filter.endDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(filter.endDate));
    }

    setTimeout(() => {
      setFilteredLogs(filtered);
      setLoading(false); // End loading state
      setFiltersVisible(false); // Hide filters after applying
    }, 1000); // Simulate a delay for loading animation
  };

  // Function to clear filters
  const clearFilters = () => {
    setFilter({
      admin: '',
      action: '',
      page: '',
      startDate: '',
      endDate: '',
    });
    setFilteredLogs(logs); // Reset to original logs
    setFiltersVisible(false); // Hide filters
  };

  // Prevent dropdown click from closing the filter card
  const handleDropdownClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto font-nunito">
      <HeaderCards
        title="Activity Logs"
        description="This page displays the activity logs of admins, tracking actions they have taken within the application. You can see the exact action performed, the page it occurred on, and the time it happened."
        animationData={animationData}
      />
     

      {/* Filter Card Section */}
      <div className="bg-yellow-100 shadow-md rounded-lg p-4 mx-3 mt-3 mb-6 cursor-pointer" onClick={() => setFiltersVisible(!filtersVisible)}>
        <h4 className="text-md font-semibold">Filter Logs</h4>
        <p className="text-sm">Click the card to expand the list of filters available for the activity logs.</p>
        {filtersVisible && (
          <div className="mt-4 flex flex-col gap-4 ">
            {/* Admin Filter */}
            <div>
              <label className="block mb-2 text-gray-700">Filter by Admin</label>
              <select
                className="border border-gray-300 rounded px-4 py-2"
                value={filter.admin}
                onChange={(e) => setFilter({ ...filter, admin: e.target.value })}
                onClick={handleDropdownClick} // Prevent propagation
              >
                <option value="">All Admins</option>
                {Object.values(adminNames).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Filter */}
            <div>
              <label className="block mb-2 text-gray-700">Filter by Action</label>
              <select
                className="border border-gray-300 rounded px-4 py-2"
                value={filter.action}
                onChange={(e) => setFilter({ ...filter, action: e.target.value })}
                onClick={handleDropdownClick} // Prevent propagation
              >
                <option value="">All Actions</option>
                <option value="Sent">Sent</option>
                <option value="Approved">Approved</option>
                <option value="Denied">Denied</option>
                <option value="Activated">Activated</option>
                <option value="Deactivated">Deactivated</option>
                <option value="Updated">Updated</option>
                <option value="Added">Added</option>
                <option value="Broadcasted">Broadcasted</option>
                <option value="Edited">Edited</option>
                <option value="Deleted">Deleted</option>
              </select>
            </div>

            {/* Page Filter */}
            <div>
              <label className="block mb-2 text-gray-700">Filter by Page</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-4 py-2"
                value={filter.page}
                onChange={(e) => setFilter({ ...filter, page: e.target.value })}
                placeholder="Enter page name"
              />
            </div>

            {/* Date Filters */}
            <div className="flex gap-4">
              <div>
                <label className="block mb-2 text-gray-700">Start Date</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded px-4 py-2"
                  value={filter.startDate}
                  onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700">End Date</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded px-4 py-2"
                  value={filter.endDate}
                  onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Apply and Clear Buttons */}
            <div className="flex gap-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={applyFilter}
                disabled={loading}
              >
                {loading ? 'Applying...' : 'Apply Filter'}
              </button>
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={clearFilters}
                disabled={loading}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Conditionally render based on loading state */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-500"></div>
          <p className="mt-4">Loading...</p>
        </div>
      ) : (
        <div className="overflow-x-auto px-3">
          {filteredLogs.length > 0 ? (
            <table className="min-w-full table-auto bg-white border border-red-300 rounded-lg shadow-md">
              <thead>
                <tr className="bg-blue-500 text-white">
                  <th className="px-4 py-2 text-left font-semibold border-b-2 border-gray-200">Admin Name</th>
                  <th className="px-4 py-2 text-left font-semibold border-b-2 border-gray-200">Action</th>
                  <th className="px-4 py-2 text-left font-semibold border-b-2 border-gray-200">Page</th>
                  <th className="px-4 py-2 text-left font-semibold border-b-2 border-gray-200">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-blue-100 transition-colors duration-300"
                  >
                    <td className="px-4 py-2 border-b border-gray-200">{adminNames[log.adminId]}</td>
                    <td className="px-4 py-2 border-b border-gray-200">{log.action}</td>
                    <td className="px-4 py-2 border-b border-gray-200">{log.page}</td>
                    <td className="px-4 py-2 border-b border-gray-200">{formatDate(log.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600">No logs available for the selected filters.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
