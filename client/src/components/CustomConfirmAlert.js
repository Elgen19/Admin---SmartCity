// src/components/CustomConfirmAlert.js
import React from 'react';

const CustomConfirmAlert = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 p-4 rounded shadow-lg z-50 bg-yellow-300 text-black">
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <div>
          <button
            className="px-2 py-1 bg-green-500 text-white rounded mr-2"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            className="px-2 py-1 bg-red-500 text-white rounded"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomConfirmAlert;
