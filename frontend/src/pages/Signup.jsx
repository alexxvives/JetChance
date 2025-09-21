import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';

export default function Signup() {
  const { register, isLoading, error } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'customer'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await register({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      // On success, navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup failed:', error);
      // Error is handled by AuthContext
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
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('auth.signup.passwordPlaceholder')}
                />
              </div>

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