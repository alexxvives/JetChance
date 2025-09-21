import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message,
  route,
  operatorName,
  confirmText = "Delete",
  cancelText = "Cancel",
  type = "danger" // danger, warning, info
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      iconColor: "text-red-600",
      iconBg: "bg-red-100",
      confirmButton: "bg-red-600 hover:bg-red-700 focus:ring-red-500"
    },
    warning: {
      iconColor: "text-yellow-600", 
      iconBg: "bg-yellow-100",
      confirmButton: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500"
    },
    info: {
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100", 
      confirmButton: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
    }
  };

  const styles = typeStyles[type] || typeStyles.danger;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Icon and Title */}
          <div className="flex items-center mb-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center mr-3`}>
              <ExclamationTriangleIcon className={`w-6 h-6 ${styles.iconColor}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          </div>

          {/* Message */}
          <div className="mb-6">
            <p className="text-gray-700 mb-3">
              {message}
            </p>
            
            {/* Flight Details */}
            {(route || operatorName) && (
              <div className="bg-gray-50 rounded-lg p-3 border">
                {route && (
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-600">Route:</span>
                    <span className="text-sm text-gray-900 font-mono">{route}</span>
                  </div>
                )}
                {operatorName && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Operator:</span>
                    <span className="text-sm text-gray-900">{operatorName}</span>
                  </div>
                )}
              </div>
            )}

            <p className="text-sm text-gray-500 mt-3">
              <strong>Note:</strong> This action is permanent and the operator will be notified.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.confirmButton}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;