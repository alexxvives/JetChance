import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const { login, isLoading, error } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleClose = () => {
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await login({
        email: formData.email,
        password: formData.password
      });
      
      // On success, navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      // Error is handled by AuthContext
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center px-6 z-50">
        <div className="max-w-md w-full">
          <div className="backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/30 relative">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">{t('auth.login.title')}</h2>
              <p className="text-gray-300">{t('auth.login.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-400 text-red-200 px-4 py-3 rounded-xl backdrop-blur-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  {t('auth.login.emailLabel')}
                </label>
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                  placeholder={t('auth.login.emailPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  {t('auth.login.passwordLabel')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 text-white placeholder-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                    placeholder={t('auth.login.passwordPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600/80 text-white font-semibold rounded-xl hover:bg-blue-700/80 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 transition-colors backdrop-blur-sm"
              >
                {isLoading ? t('auth.login.signingIn') : t('auth.login.signInButton')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-300">
                {t('auth.login.noAccount')}{' '}
                <button 
                  onClick={() => navigate('/signup')}
                  className="text-blue-400 font-semibold hover:text-blue-300"
                >
                  {t('auth.login.signUp')}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}
