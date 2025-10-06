import React, { useState } from 'react';
import { CreditCardIcon, LockClosedIcon, UserIcon, EnvelopeIcon, PhoneIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';

export default function PayUPaymentForm({ 
  amount, 
  currency = 'COP', 
  onPaymentSuccess, 
  onPaymentError, 
  flightDetails, 
  flightId,
  contactInfo,
  passengerData 
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Determine if flight is international
  const isInternationalFlight = () => {
    if (!flightDetails) return false;
    
    const originCountry = flightDetails.originCountry || 'CO';
    const destinationCountry = flightDetails.destinationCountry || 'CO';
    
    // If either origin or destination is not Colombia, it's international
    return originCountry !== 'CO' || destinationCountry !== 'CO';
  };

  // Get available document types based on flight type
  const getDocumentTypes = () => {
    if (isInternationalFlight()) {
      // International flight - only passport
      return [
        { value: 'PP', label: 'Pasaporte / Passport' }
      ];
    } else {
      // Domestic flight - all Colombian document types
      return [
        { value: 'CC', label: 'Cédula de Ciudadanía' },
        { value: 'CE', label: 'Cédula de Extranjería' },
        { value: 'NIT', label: 'NIT' },
        { value: 'PP', label: 'Pasaporte / Passport' }
      ];
    }
  };
  
  // Customer data state
  const [customerData, setCustomerData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: contactInfo?.email || '',
    phone: contactInfo?.phone || '',
    
    // Billing Information
    documentType: 'CC', // Colombian ID types: CC (Cédula), CE (Cédula Extranjería), NIT, etc.
    documentNumber: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingCountry: 'CO',
    billingZipCode: ''
  });

  // Credit card data state
  const [creditCardData, setCreditCardData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardHolderName: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD'); // CREDIT_CARD, PSE, CASH
  const [selectedBank, setSelectedBank] = useState('');

  // Colombian banks for PSE
  const colombianBanks = [
    { code: 'BANCOLOMBIA', name: 'Bancolombia' },
    { code: 'BANCO_DE_BOGOTA', name: 'Banco de Bogotá' },
    { code: 'BANCO_POPULAR', name: 'Banco Popular' },
    { code: 'BBVA_COLOMBIA', name: 'BBVA Colombia' },
    { code: 'BANCO_DE_OCCIDENTE', name: 'Banco de Occidente' },
    { code: 'BANCO_CAJA_SOCIAL', name: 'Banco Caja Social' },
    { code: 'BANCO_AV_VILLAS', name: 'Banco AV Villas' },
    { code: 'CITIBANK', name: 'Citibank' },
    { code: 'BANCO_DAVIVIENDA', name: 'Davivienda' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreditCardChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.substr(0, 19);
    }

    // Limit CVV to 4 digits
    if (name === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').substr(0, 4);
    }

    setCreditCardData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Capture current payment method value to avoid closure issues
    const currentPaymentMethod = paymentMethod;
    console.log('handleSubmit - Current payment method:', currentPaymentMethod);

    try {
      // Prepare PayU payment data
      const paymentData = {
        amount: amount,
        currency: currency,
        flightId: flightId,
        paymentMethod: currentPaymentMethod,
        customer: customerData,
        flightDetails: flightDetails,
        ...(currentPaymentMethod === 'PSE' && { selectedBank }),
        ...(currentPaymentMethod === 'CREDIT_CARD' && { creditCard: creditCardData })
      };

      // For development, simulate payment success
      // In production, this would make an API call to your backend
      // which then communicates with PayU's API
      
      console.log('PayU Payment Data:', paymentData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // If payment succeeds, create the booking in the database
      const passengers = passengerData.map(passenger => ({
        firstName: passenger.firstName || 'Guest',
        lastName: passenger.lastName || 'User',
        dateOfBirth: passenger.dateOfBirth || null,
        email: contactInfo?.email || 'customer@example.com',
        documentType: passenger.documentType || 'CC',
        documentNumber: passenger.documentNumber || null
      }));

      console.log('Mapped passengers for booking:', passengers);
      console.log('Individual passenger check:');
      passengers.forEach((p, i) => {
        console.log(`Passenger ${i + 1}:`, {
          firstName: p.firstName,
          lastName: p.lastName,
          firstNameLength: p.firstName?.length,
          lastNameLength: p.lastName?.length
        });
      });

      const bookingData = {
        flightId: flightId,
        passengers: passengers,
        specialRequests: '',
        totalAmount: amount,
        paymentMethod: currentPaymentMethod,
        contact_email: contactInfo?.email
      };

      console.log('Creating booking with data:', bookingData);
      console.log('Flight ID:', flightId);
      console.log('Passengers data:', passengerData);
      console.log('Contact info:', contactInfo);

      // Call the bookings API to create the booking
      const token = localStorage.getItem('accessToken');
      console.log('Auth token exists:', !!token);
      
      const API_BASE_URL = 'http://localhost:4000/api';
      const bookingResponse = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(bookingData)
      });

      console.log('Booking response status:', bookingResponse.status);
      
      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        console.error('Booking creation failed:', errorData);
        throw new Error(errorData.message || `Failed to create booking (${bookingResponse.status})`);
      }

      const bookingApiResponse = await bookingResponse.json();
      console.log('Booking created successfully:', bookingApiResponse);

      // Debug: Check paymentMethod value before creating success response
      console.log('PaymentMethod value before success response:', currentPaymentMethod);
      console.log('PaymentMethod type:', typeof currentPaymentMethod);

      // Create the success response
      const successResponse = {
        success: true,
        transactionId: `TXN_${Date.now()}`,
        paymentMethod: currentPaymentMethod,
        amount: amount,
        currency: currency,
        booking: bookingApiResponse.booking, // Extract the actual booking object from the response
        customerData: {
          firstName: user?.firstName || 'Guest',
          lastName: user?.lastName || 'User',
          email: contactInfo?.email || user?.email,
          phone: contactInfo?.phone
        }
      };

      console.log('Success response created:', successResponse);
      onPaymentSuccess(successResponse);

    } catch (error) {
      console.error('PayU payment error:', error);
      onPaymentError(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    // Since email and phone come from contactInfo prop, and we don't collect names/documents in payment form,
    // we only need to validate payment-specific fields
    const contactValid = contactInfo?.email && contactInfo?.phone;
    
    if (paymentMethod === 'CREDIT_CARD') {
      const creditCardValid = creditCardData.cardNumber.replace(/\s/g, '').length >= 13 &&
                             creditCardData.expiryMonth !== '' &&
                             creditCardData.expiryYear !== '' &&
                             creditCardData.cvv.length >= 3 &&
                             creditCardData.cardHolderName.trim() !== '';
      return contactValid && creditCardValid;
    }
    
    if (paymentMethod === 'PSE') {
      return contactValid && selectedBank !== '';
    }
    
    return contactValid;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center mb-6">
          <CreditCardIcon className="h-8 w-8 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">{t('payment.completePayment')}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Método de Pago / Payment Method
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`relative rounded-lg border p-4 flex flex-col items-center text-center hover:bg-gray-50 ${
                  paymentMethod === 'CREDIT_CARD' 
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600' 
                    : 'border-gray-300'
                }`}
              >
                <CreditCardIcon className="h-6 w-6 text-gray-600 mb-2" />
                <span className="text-sm font-medium">Tarjeta de Crédito</span>
                <span className="text-xs text-gray-500">Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('PSE')}
                className={`relative rounded-lg border p-4 flex flex-col items-center text-center hover:bg-gray-50 ${
                  paymentMethod === 'PSE' 
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600' 
                    : 'border-gray-300'
                }`}
              >
                <BanknotesIcon className="h-6 w-6 text-gray-600 mb-2" />
                <span className="text-sm font-medium">PSE</span>
                <span className="text-xs text-gray-500">Transferencia Bancaria</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`relative rounded-lg border p-4 flex flex-col items-center text-center hover:bg-gray-50 ${
                  paymentMethod === 'CASH' 
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600' 
                    : 'border-gray-300'
                }`}
              >
                <BanknotesIcon className="h-6 w-6 text-gray-600 mb-2" />
                <span className="text-sm font-medium">Efectivo</span>
                <span className="text-xs text-gray-500">Efecty, Baloto</span>
              </button>
            </div>
          </div>

          {/* PSE Bank Selection */}
          {paymentMethod === 'PSE' && (
            <div>
              <label htmlFor="bank" className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona tu Banco
              </label>
              <select
                id="bank"
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecciona un banco</option>
                {colombianBanks.map(bank => (
                  <option key={bank.code} value={bank.code}>{bank.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Credit Card Information */}
          {paymentMethod === 'CREDIT_CARD' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <CreditCardIcon className="w-5 h-5 mr-2" />
                Información de Tarjeta de Crédito
              </h3>
              
              <div>
                <label htmlFor="cardHolderName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Titular *
                </label>
                <input
                  type="text"
                  id="cardHolderName"
                  name="cardHolderName"
                  value={creditCardData.cardHolderName}
                  onChange={handleCreditCardChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre como aparece en la tarjeta"
                  required
                />
              </div>

              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Tarjeta *
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={creditCardData.cardNumber}
                  onChange={handleCreditCardChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700 mb-2">
                    Mes *
                  </label>
                  <select
                    id="expiryMonth"
                    name="expiryMonth"
                    value={creditCardData.expiryMonth}
                    onChange={handleCreditCardChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Mes</option>
                    {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                      <option key={month} value={month.toString().padStart(2, '0')}>
                        {month.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700 mb-2">
                    Año *
                  </label>
                  <select
                    id="expiryYear"
                    name="expiryYear"
                    value={creditCardData.expiryYear}
                    onChange={handleCreditCardChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Año</option>
                    {Array.from({length: 20}, (_, i) => new Date().getFullYear() + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                    CVV *
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={creditCardData.cvv}
                    onChange={handleCreditCardChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123"
                    maxLength="4"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Resumen del Pago</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total:</span>
              <span className="text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat('es-CO', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(amount)} {currency}
              </span>
            </div>
          </div>

          {/* Security Notice for Credit Cards */}
          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid() || isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <LockClosedIcon className="w-5 h-5 mr-2" />
            {isLoading ? 'Procesando...' : `Pagar ${currency} ${new Intl.NumberFormat('es-CO').format(amount)}`}
          </button>

          {/* Security Notice */}
          <div className="text-center text-xs text-gray-500 mt-1">
            <LockClosedIcon className="w-4 h-4 inline mr-1" />
            Pago seguro procesado por PayU Latam
          </div>
        </form>
      </div>
    </div>
  );
}