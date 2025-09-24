// BACKUP OF ORIGINAL FLIGHT CARD DESIGN
// This is the original FlightCard component from SafeOperatorDashboard.jsx
// Saved on 2025-09-24 for potential rollback

import React from 'react';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

function FlightCard({ flight, navigate, isPast = false, onDelete }) {
  console.log('🎯 FlightCard flight data:', flight);
  
  const cardOpacity = isPast ? 'opacity-75' : '';
  const headerGradient = 'bg-gradient-to-r from-blue-50 to-indigo-50'; // Same blue gradient for all flights

  return (
    <div className={`bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 hover:border-blue-300 ${cardOpacity}`}>
      {/* Flight Header with Aircraft & Date */}
      <div className={`${headerGradient} px-4 py-3 rounded-t-lg border-b border-gray-100`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-lg text-gray-900">
                {flight.aircraft?.name || flight.aircraft?.manufacturer || 'Private Jet'}
              </h4>
              <p className="text-sm text-gray-600">
                {flight.departure_datetime || flight.schedule?.departure ? 
                  new Date(flight.departure_datetime || flight.schedule.departure).toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'Date TBD'}
              </p>
            </div>
          </div>
          {isPast && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              Completed
            </span>
          )}
        </div>
      </div>

      {/* Flight Content */}
      <div className="p-3">
        {/* Departure Details - Grayed out rectangle */}
        <div className="bg-gray-100 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-600">FROM</p>
              <p className="text-xl font-bold text-gray-900">{flight.origin?.code || 'N/A'}</p>
            </div>
            <svg className="w-5 h-5 text-gray-500 mx-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <div className="text-center">
              <p className="text-sm text-gray-600">TO</p>
              <p className="text-xl font-bold text-gray-900">{flight.destination?.code || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Info squares below */}
        <div className="grid grid-cols-3 gap-2">
          {/* Status square */}
          <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              flight.status === 'approved' ? 'bg-green-100 text-green-700' :
              flight.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              flight.status === 'denied' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {flight.status || 'Unknown'}
            </span>
          </div>

          {/* Seats square */}
          <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500 mb-1">Seats</p>
            <p className="text-sm font-semibold text-gray-900">{flight.available_seats || 'N/A'}</p>
          </div>

          {/* Price square */}
          <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500 mb-1">Price</p>
            <p className="text-sm font-semibold text-gray-900">
              ${flight.empty_leg_price ? flight.empty_leg_price.toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between">
            <button
              onClick={() => navigate(`/flights/${flight.id}`)}
              className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              View Details
            </button>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate(`/edit-flight/${flight.id}`)}
                className="flex items-center text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </button>
              <button
                onClick={() => onDelete(flight.id, `${flight.origin?.code || 'Unknown'} → ${flight.destination?.code || 'Unknown'}`)}
                className="flex items-center text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlightCard;