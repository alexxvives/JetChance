import React, { useState } from 'react';
import { XMarkIcon, CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../contexts/TranslationContext';
import AirportAutocomplete from './AirportAutocomplete';
import CustomDateTimePicker from './CustomDateTimePicker';

const RegularJetRequestModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    origin: null,
    destination: null,
    departureDateTime: '',
    returnDateTime: '',
    passengers: 1,
    isRoundTrip: false,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create the request data
      const requestData = {
        type: 'regular_jet',
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        },
        flightDetails: {
          origin: formData.origin,
          destination: formData.destination,
          departureDateTime: formData.departureDateTime,
          returnDateTime: formData.isRoundTrip ? formData.returnDateTime : null,
          passengers: formData.passengers,
          isRoundTrip: formData.isRoundTrip,
          notes: formData.notes
        },
        requestedAt: new Date().toISOString()
      };

      console.log('Regular Jet Request submitted:', requestData);
      
      // TODO: Send to backend API
      // await regularJetAPI.submitRequest(requestData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting regular jet request:', error);
      alert(t('regularJetRequest.errors.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      origin: null,
      destination: null,
      departureDateTime: '',
      returnDateTime: '',
      passengers: 1,
      isRoundTrip: false,
      notes: ''
    });
    setSubmitted(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        ></div>

        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          {submitted ? (
            // Thank you message
            <div className="px-6 py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('regularJetRequest.success.title')}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {t('regularJetRequest.success.message')}
              </p>
              <button
                onClick={handleClose}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('regularJetRequest.success.close')}
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {t('regularJetRequest.title')}
                </h3>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 py-4">
                <div className="mb-6">
                  <p className="text-sm text-gray-600">
                    {t('regularJetRequest.subtitle')}
                  </p>
                </div>

                {/* Contact Information */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    {t('regularJetRequest.contactInfo.title')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('regularJetRequest.contactInfo.firstName')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t('regularJetRequest.contactInfo.firstNamePlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('regularJetRequest.contactInfo.lastName')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t('regularJetRequest.contactInfo.lastNamePlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('regularJetRequest.contactInfo.email')} *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t('regularJetRequest.contactInfo.emailPlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('regularJetRequest.contactInfo.phone')} *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t('regularJetRequest.contactInfo.phonePlaceholder')}
                      />
                    </div>
                  </div>
                </div>

                {/* Flight Details */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    {t('regularJetRequest.flightDetails.title')}
                  </h4>
                  
                  {/* Origin and Destination */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('regularJetRequest.flightDetails.origin')} *
                      </label>
                      <AirportAutocomplete
                        value={formData.origin}
                        onChange={(airport) => handleInputChange('origin', airport)}
                        placeholder={t('regularJetRequest.flightDetails.originPlaceholder')}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('regularJetRequest.flightDetails.destination')} *
                      </label>
                      <AirportAutocomplete
                        value={formData.destination}
                        onChange={(airport) => handleInputChange('destination', airport)}
                        placeholder={t('regularJetRequest.flightDetails.destinationPlaceholder')}
                        required
                      />
                    </div>
                  </div>

                  {/* Departure Date & Time */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <CalendarDaysIcon className="h-4 w-4 inline mr-1" />
                      {t('regularJetRequest.flightDetails.departureDateTime')} *
                    </label>
                    <CustomDateTimePicker
                      value={formData.departureDateTime}
                      onChange={(datetime) => handleInputChange('departureDateTime', datetime)}
                      placeholder={t('regularJetRequest.flightDetails.departurePlaceholder')}
                      required
                    />
                  </div>

                  {/* Round Trip Toggle */}
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isRoundTrip}
                        onChange={(e) => handleInputChange('isRoundTrip', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {t('regularJetRequest.flightDetails.roundTrip')}
                      </span>
                    </label>
                  </div>

                  {/* Return Date & Time (if round trip) */}
                  {formData.isRoundTrip && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <ClockIcon className="h-4 w-4 inline mr-1" />
                        {t('regularJetRequest.flightDetails.returnDateTime')} *
                      </label>
                      <CustomDateTimePicker
                        value={formData.returnDateTime}
                        onChange={(datetime) => handleInputChange('returnDateTime', datetime)}
                        placeholder={t('regularJetRequest.flightDetails.returnPlaceholder')}
                        required={formData.isRoundTrip}
                      />
                    </div>
                  )}

                  {/* Passengers */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('regularJetRequest.flightDetails.passengers')} *
                    </label>
                    <select
                      value={formData.passengers}
                      onChange={(e) => handleInputChange('passengers', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} {i === 0 ? t('regularJetRequest.flightDetails.passenger') : t('regularJetRequest.flightDetails.passengersPlural')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('regularJetRequest.flightDetails.notes')}
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('regularJetRequest.flightDetails.notesPlaceholder')}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {t('regularJetRequest.buttons.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('regularJetRequest.buttons.submitting')}
                      </>
                    ) : (
                      t('regularJetRequest.buttons.submit')
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegularJetRequestModal;