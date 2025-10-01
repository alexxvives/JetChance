import React from 'react';
import { XMarkIcon, ClockIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../contexts/TranslationContext';

const FlightTypeSelectionModal = ({ isOpen, onClose, onSelectEmptyLeg, onSelectRegularJet }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Beautiful Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 bg-opacity-95 backdrop-blur-sm transition-opacity"></div>
      
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
          
          {/* Responsive Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/10 rounded-lg sm:rounded-xl md:rounded-2xl mb-3 sm:mb-4 backdrop-blur-sm">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light text-white mb-2 tracking-wide">
              {t('flightTypeSelection.title')}
            </h2>
            <p className="text-white/70 text-xs sm:text-sm md:text-base leading-relaxed max-w-xs sm:max-w-sm md:max-w-md mx-auto px-2 sm:px-0">
              {t('flightTypeSelection.subtitle')}
            </p>
          </div>

          {/* Responsive Flight Options */}
          <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-4 sm:mb-6">
            
            {/* Empty Leg Option - Responsive */}
            <div
              onClick={() => {
                onSelectEmptyLeg();
                onClose();
              }}
              className="group cursor-pointer"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 hover:bg-white transition-all duration-300 hover:shadow-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-green-100 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                      <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 mb-0.5 sm:mb-1 text-xs sm:text-sm md:text-base lg:text-lg">
                        {t('flightTypeSelection.emptyLeg.title')}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-gray-500 line-clamp-1">
                        {t('flightTypeSelection.emptyLeg.benefits.savings')}
                      </p>
                    </div>
                  </div>
                  <div className="text-green-600 font-medium text-xs sm:text-sm md:text-base whitespace-nowrap ml-2 sm:ml-3">
                    {t('flightTypeSelection.emptyLeg.action')}
                  </div>
                </div>
              </div>
            </div>

            {/* Regular Jet Option - Responsive */}
            <div
              onClick={() => {
                onSelectRegularJet();
                onClose();
              }}
              className="group cursor-pointer"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 hover:bg-white transition-all duration-300 hover:shadow-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-100 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                      <AdjustmentsHorizontalIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 mb-0.5 sm:mb-1 text-xs sm:text-sm md:text-base lg:text-lg">
                        {t('flightTypeSelection.regularJet.title')}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-gray-500 line-clamp-1">
                        {t('flightTypeSelection.regularJet.benefits.flexible')}
                      </p>
                    </div>
                  </div>
                  <div className="text-blue-600 font-medium text-xs sm:text-sm md:text-base whitespace-nowrap ml-2 sm:ml-3">
                    {t('flightTypeSelection.regularJet.action')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Responsive Browse Both Option */}
          <div className="text-center mt-4 sm:mt-6 md:mt-8">
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-xs sm:text-sm md:text-base font-light transition-colors duration-200"
            >
              {t('flightTypeSelection.browseBoth')} →
            </button>
          </div>

          {/* Responsive Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 md:-top-3 md:-right-3 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200"
          >
            <XMarkIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
          </button>

        </div>
      </div>
    </div>
  );
};

export default FlightTypeSelectionModal;