import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function Signup() {
  const { register, isLoading, error } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'customer',
    signupCode: '',
    companyName: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const registrationData = {
        email: formData.email,
        password: formData.password,
        role: formData.role
      };

      // Add role-specific fields
      if (formData.role === 'customer') {
        registrationData.first_name = formData.firstName;
        registrationData.last_name = formData.lastName;
      } else if (formData.role === 'operator') {
        registrationData.signupCode = formData.signupCode;
        registrationData.companyName = formData.companyName;
        // For operators, we don't send first/last name
      }

      await register(registrationData);
      
      // On success, navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by AuthContext, no need to log expected validation errors
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.signup.title')}</h2>
              <p className="text-gray-600">{t('auth.signup.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* Account Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('auth.signup.accountTypeLabel')}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`cursor-pointer p-4 border rounded-xl text-center transition-colors ${
                    formData.role === 'customer' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="customer"
                      checked={formData.role === 'customer'}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="sr-only"
                    />
                    <div className="font-semibold">{t('auth.signup.customerLabel')}</div>
                    <div className="text-sm text-gray-500 mt-1">{t('auth.signup.customerDescription')}</div>
                  </label>
                  
                  <label className={`cursor-pointer p-4 border rounded-xl text-center transition-colors ${
                    formData.role === 'operator' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="operator"
                      checked={formData.role === 'operator'}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="sr-only"
                    />
                    <div className="font-semibold">{t('auth.signup.operatorLabel')}</div>
                    <div className="text-sm text-gray-500 mt-1">{t('auth.signup.operatorDescription')}</div>
                  </label>
                </div>
              </div>
              
              {/* Customer Name Fields */}
              {formData.role === 'customer' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('auth.signup.firstNameLabel')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('auth.signup.firstNamePlaceholder')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('auth.signup.lastNameLabel')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('auth.signup.lastNamePlaceholder')}
                    />
                  </div>
                </div>
              )}

              {/* Operator Company Name Field */}
              {formData.role === 'operator' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.signup.operatorCompanyLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('auth.signup.operatorCompanyPlaceholder')}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {t('auth.signup.operatorCompanyHelp')}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.signup.emailLabel')}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('auth.signup.emailPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.signup.passwordLabel')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('auth.signup.passwordPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)
                </p>
              </div>

              {/* Signup Code for Operators */}
              {formData.role === 'operator' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.signup.signupCodeLabel')}
                  </label>
                  <input
                    type="text"
                    required={formData.role === 'operator'}
                    value={formData.signupCode}
                    onChange={(e) => setFormData({...formData, signupCode: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('auth.signup.signupCodePlaceholder')}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {t('auth.signup.signupCodeHelp')}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {isLoading ? t('auth.signup.creatingAccount') : 
                  formData.role === 'operator' ? t('auth.signup.createOperatorAccount') : t('auth.signup.createCustomerAccount')
                }
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {t('auth.signup.haveAccount')}{' '}
                <button 
                  onClick={() => navigate('/login')}
                  className="text-blue-600 font-semibold hover:text-blue-700"
                >
                  {t('auth.signup.signIn')}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}
