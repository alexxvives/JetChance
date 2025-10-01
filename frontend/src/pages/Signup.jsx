import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/outline';

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

  const handleClose = () => {
    navigate('/');
  };

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
    <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center px-6 z-50">
        <div className="max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 relative">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-gray-300 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">{t('auth.signup.title')}</h2>
              <p className="text-gray-300">{t('auth.signup.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-400 text-red-200 px-4 py-3 rounded-xl backdrop-blur-sm">
                  {error}
                </div>
              )}

              {/* Account Type Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  {t('auth.signup.accountTypeLabel')}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`cursor-pointer p-4 border rounded-xl text-center transition-colors ${
                    formData.role === 'customer' 
                      ? 'border-blue-400 bg-blue-500/20 text-blue-200' 
                      : 'border-white/20 bg-white/5 text-white hover:border-white/40'
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
                    <div className="text-sm text-gray-300 mt-1">{t('auth.signup.customerDescription')}</div>
                  </label>
                  
                  <label className={`cursor-pointer p-4 border rounded-xl text-center transition-colors ${
                    formData.role === 'operator' 
                      ? 'border-blue-400 bg-blue-500/20 text-blue-200' 
                      : 'border-white/20 bg-white/5 text-white hover:border-white/40'
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
                    <div className="text-sm text-gray-300 mt-1">{t('auth.signup.operatorDescription')}</div>
                  </label>
                </div>
              </div>
              
              {/* Customer Name Fields */}
              {formData.role === 'customer' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      {t('auth.signup.firstNameLabel')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                      placeholder={t('auth.signup.firstNamePlaceholder')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      {t('auth.signup.lastNameLabel')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                      placeholder={t('auth.signup.lastNamePlaceholder')}
                    />
                  </div>
                </div>
              )}

              {/* Operator Company Name Field */}
              {formData.role === 'operator' && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    {t('auth.signup.operatorCompanyLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                    placeholder={t('auth.signup.operatorCompanyPlaceholder')}
                  />
                  <p className="mt-1 text-sm text-gray-300">
                    {t('auth.signup.operatorCompanyHelp')}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  {t('auth.signup.emailLabel')}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                  placeholder={t('auth.signup.emailPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  {t('auth.signup.passwordLabel')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 text-white placeholder-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                    placeholder={t('auth.signup.passwordPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-300 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-300">
                  Must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)
                </p>
              </div>

              {/* Signup Code for Operators */}
              {formData.role === 'operator' && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    {t('auth.signup.signupCodeLabel')}
                  </label>
                  <input
                    type="text"
                    required={formData.role === 'operator'}
                    value={formData.signupCode}
                    onChange={(e) => setFormData({...formData, signupCode: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                    placeholder={t('auth.signup.signupCodePlaceholder')}
                  />
                  <p className="mt-1 text-sm text-gray-300">
                    {t('auth.signup.signupCodeHelp')}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600/80 text-white font-semibold rounded-xl hover:bg-blue-700/80 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 transition-colors backdrop-blur-sm"
              >
                {isLoading ? t('auth.signup.creatingAccount') : 
                  formData.role === 'operator' ? t('auth.signup.createOperatorAccount') : t('auth.signup.createCustomerAccount')
                }
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-300">
                {t('auth.signup.haveAccount')}{' '}
                <button 
                  onClick={() => navigate('/login')}
                  className="text-blue-400 font-semibold hover:text-blue-300"
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
