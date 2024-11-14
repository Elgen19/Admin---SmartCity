// src/components/CustomAlert.js
import React from 'react';

const CustomAlert = ({ message, type, onClose }) => {
  const alertStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  return (
    <div
      className={`fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 p-4 rounded shadow-lg z-50 ${alertStyles[type]}`}
    >
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button
          className="ml-4 text-red font-bold"
          onClick={onClose}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default CustomAlert;
