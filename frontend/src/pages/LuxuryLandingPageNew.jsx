import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Wave from 'react-wavify';
import {
  PaperAirplaneIcon,
  ShieldCheckIcon,
  ClockIcon,
  StarIcon,
  MapPinIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import Footer from '../components/Footer';

const LuxuryLandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isLoading, error } = useAuth();
  const { t } = useTranslation();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Monitor URL changes to show modals
  useEffect(() => {
    const currentPath = location.pathname;
    const currentSearch = location.search;
    
    if (currentPath === '/login') {
      setShowLoginModal(true);
      // Replace the URL without the login path, but preserve any search params
      window.history.replaceState({}, '', '/' + currentSearch);
    } else if (currentPath === '/signup') {
      setShowSignupModal(true);
      // Replace the URL without the signup path, but preserve any search params
      window.history.replaceState({}, '', '/' + currentSearch);
    }
  }, [location]); // Monitor entire location object for any changes
  const [formData, setFormData] = useState({
    serviceType: 'full-charter',
    name: '',
    email: '',
    phone: '',
    departure: '',
    destination: '',
    date: '',
    passengers: '',
    details: ''
  });
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [authFormData, setAuthFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    password: '',
    role: 'customer'
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleAuthInputChange = (e) => {
    setAuthFormData({
      ...authFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Validate that a role is selected
    if (!authFormData.role) {
      return; // The UI will show which role should be selected
    }
    
    try {
      // Prepare data based on role
      const signupData = {
        email: authFormData.email,
        password: authFormData.password,
        role: authFormData.role
      };
      
      // Add role-specific fields
      if (authFormData.role === 'customer') {
        signupData.first_name = authFormData.firstName;
        signupData.last_name = authFormData.lastName;
      } else if (authFormData.role === 'operator') {
        signupData.companyName = authFormData.companyName;
        signupData.signupCode = 'code'; // Required for operators
      }
      
      await register(signupData);
      setShowSignupModal(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup failed:', error);
      // Error will be displayed by the AuthContext error state
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login({
        email: authFormData.email,
        password: authFormData.password
      });
      setShowLoginModal(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Map form data to backend schema
      const quoteData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service_type: formData.serviceType,
        origin: formData.departure,
        destination: formData.destination,
        departure_date: formData.date,
        departure_time: '', // We don't collect time separately in this form
        passengers: formData.passengers,
        notes: formData.details
      };

      // Save quote to database first
      const quoteResponse = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData)
      });

      if (!quoteResponse.ok) {
        throw new Error('Failed to save quote');
      }

      // Send email with form data
      const emailData = {
        to: 'alexxvives@gmail.com',
        subject: `New JetChance Quote Request from ${formData.name}`,
        html: `
          <h2>New Quote Request</h2>
          <p><strong>Service Type:</strong> ${formData.serviceType}</p>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Phone:</strong> ${formData.phone}</p>
          <p><strong>Departure:</strong> ${formData.departure}</p>
          <p><strong>Destination:</strong> ${formData.destination}</p>
          <p><strong>Date:</strong> ${formData.date}</p>
          <p><strong>Passengers:</strong> ${formData.passengers}</p>
          <p><strong>Additional Details:</strong> ${formData.details}</p>
          <br>
          <p>This request was submitted through the JetChance website.</p>
        `
      };

      // Send email (don't fail if email fails)
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData)
        });
      } catch (emailError) {
        console.warn('Email sending failed, but quote was saved:', emailError);
      }

      setShowSuccessToast(true);
      // Reset form
      setFormData({
        serviceType: 'full-charter',
        name: '',
        email: '',
        phone: '',
        departure: '',
        destination: '',
        date: '',
        passengers: '',
        details: ''
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      alert(t('messages.errorSubmitting'));
    }
    
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const scrollToForm = () => {
    const formSection = document.getElementById('inquiry-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navigateToSignup = () => {
    setShowSignupModal(true);
  };

  const navigateToLogin = () => {
    setShowLoginModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-800">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          {t('messages.quoteRequestSent')}
        </div>
      )}

      {/* 1. Hero Section */}
      <section className="relative min-h-screen flex items-start justify-center pt-8 sm:pt-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/home/hero-jet.jpg" 
            alt="Luxury Private Jet"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/100 via-blue-900/75 to-slate-700/15"></div>
        </div>

        {/* Wave Overlay on top of hero image */}
        <div className="absolute inset-0 z-5 pointer-events-none">
          {/* Single bottom transition wave */}
          <Wave 
            fill='#334155'
            paused={false}
            style={{ 
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '150px',
              border: 'none',
              outline: 'none',
              background: 'transparent'
            }}
            options={{
              height: 60,
              amplitude: 50,
              speed: 0.1,
              points: 5
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col justify-start sm:justify-center pt-16 sm:pt-8">
          {/* Headline */}
          <div className="mb-6 sm:mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
              <span className="text-white">{t('home.hero.headline.whatIf')}</span>{' '}
              <span className="text-amber-400">{t('home.hero.headline.private')}</span>{' '}
              <span className="text-white">{t('home.hero.headline.wasAccessible')}</span>{' '}
              <span className="text-amber-400">{t('home.hero.headline.commercial')}</span>{' '}
              <span className="text-white">{t('home.hero.headline.ticket')}</span>
            </h1>
          </div>

          {/* Subheadline */}
          <div className="mb-10 sm:mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed font-light">
              {t('home.hero.subtitle')}
            </p>
          </div>

          {/* Dual CTAs */}
          <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <button 
              onClick={navigateToSignup}
              className="w-full sm:max-w-xs md:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl text-base sm:text-lg font-semibold hover:bg-white/20 hover:border-white/50 transition-all duration-300 hover:scale-105 shadow-xl"
            >
              {t('home.hero.cta.emptyLeg')}
            </button>
            <button 
              onClick={scrollToForm}
              className="w-full sm:max-w-xs md:w-auto px-8 py-4 bg-amber-500 text-slate-900 rounded-xl text-base sm:text-lg font-semibold hover:bg-amber-400 transition-all duration-300 hover:scale-105 shadow-2xl shadow-amber-500/50"
            >
              {t('home.hero.cta.fullCharter')}
            </button>
          </div>

          {/* Scroll Indicator */}
          <div className="animate-bounce flex justify-center mt-8 sm:mt-12">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full">
              <div className="w-1 h-3 bg-white/70 rounded-full mx-auto mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Service Comparison Section */}
      <section className="pt-12 pb-24 bg-gradient-to-b from-slate-700 to-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('home.services.title')}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t('home.services.subtitle')}
            </p>
          </div>

          {/* Two Card Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
            {/* Empty Leg Card */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden border-2 border-green-200">
              <div className="relative flex flex-col h-full p-6 sm:p-8">
                {/* Badge - Top Right */}
                <div className="absolute top-4 right-4">
                  <div className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                    <ArrowTrendingDownIcon className="w-4 h-4" />
                    <span className="hidden xs:inline">{t('home.services.emptyLeg.badge')}</span>
                    <span className="xs:hidden">-90%</span>
                  </div>
                </div>

                {/* Title */}
                <div className="mt-8 mb-4">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <PaperAirplaneIcon className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500 flex-shrink-0" />
                    <span>{t('home.services.emptyLeg.title')}</span>
                  </h3>
                </div>

                {/* Description */}
                <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
                  {t('home.services.emptyLeg.description')}
                </p>

                {/* Perfect for */}
                <div className="mb-6">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                    {t('home.services.emptyLeg.perfectFor')}
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-gray-600 text-sm sm:text-base">
                      <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{t('home.services.emptyLeg.benefits.0')}</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600 text-sm sm:text-base">
                      <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{t('home.services.emptyLeg.benefits.1')}</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600 text-sm sm:text-base">
                      <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{t('home.services.emptyLeg.benefits.2')}</span>
                    </li>
                  </ul>
                </div>

                {/* Divisor */}
                <div className="border-t border-gray-200 my-4 md:my-6"></div>

                {/* What you get - Always visible, smaller on mobile */}
                <div>
                  <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-2 md:mb-3">
                    {t('home.services.emptyLeg.whatYouGet')}
                  </h4>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    {t('home.services.emptyLeg.details')}
                  </p>
                </div>
              </div>
            </div>

            {/* Full Charter Card */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden border-2 border-black">
              <div className="relative flex flex-col h-full p-6 sm:p-8">
                {/* Badge - Top Right */}
                <div className="absolute top-4 right-4">
                  <div className="bg-black text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold">
                    {t('home.services.fullCharter.badge')}
                  </div>
                </div>

                {/* Title */}
                <div className="mt-8 mb-4">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <CalendarIcon className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500 flex-shrink-0" />
                    <span>{t('home.services.fullCharter.title')}</span>
                  </h3>
                </div>

                {/* Description */}
                <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
                  {t('home.services.fullCharter.description')}
                </p>

                {/* Perfect for */}
                <div className="mb-6">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                    {t('home.services.fullCharter.perfectFor')}
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-gray-600 text-sm sm:text-base">
                      <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{t('home.services.fullCharter.benefits.0')}</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600 text-sm sm:text-base">
                      <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{t('home.services.fullCharter.benefits.1')}</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600 text-sm sm:text-base">
                      <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{t('home.services.fullCharter.benefits.2')}</span>
                    </li>
                  </ul>
                </div>

                {/* Divisor */}
                <div className="border-t border-gray-200 my-4 md:my-6"></div>

                {/* What you get - Always visible, smaller on mobile */}
                <div>
                  <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-2 md:mb-3">
                    {t('home.services.fullCharter.whatYouGet')}
                  </h4>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    {t('home.services.fullCharter.details')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Benefits Section */}
      <section className="py-16 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('home.benefits.title')}
            </h2>
          </div>

          {/* 4-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Safety First */}
            <div className="text-center group hover:scale-105 transition-all duration-300 p-5 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20">
              <div className="mb-4 flex justify-center">
                <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center group-hover:bg-amber-500 transition-all duration-300">
                  <ShieldCheckIcon className="w-7 h-7 text-amber-400 group-hover:text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-100 transition-colors">{t('home.benefits.safetyFirst.title')}</h3>
              <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors leading-relaxed">
                {t('home.benefits.safetyFirst.description')}
              </p>
            </div>

            {/* Time Efficient */}
            <div className="text-center group hover:scale-105 transition-all duration-300 p-5 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20">
              <div className="mb-4 flex justify-center">
                <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center group-hover:bg-amber-500 transition-all duration-300">
                  <ClockIcon className="w-7 h-7 text-amber-400 group-hover:text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-100 transition-colors">{t('home.benefits.timeEfficient.title')}</h3>
              <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors leading-relaxed">
                {t('home.benefits.timeEfficient.description')}
              </p>
            </div>

            {/* Premium Comfort */}
            <div className="text-center group hover:scale-105 transition-all duration-300 p-5 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20">
              <div className="mb-4 flex justify-center">
                <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center group-hover:bg-amber-500 transition-all duration-300">
                  <StarIcon className="w-7 h-7 text-amber-400 group-hover:text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-100 transition-colors">{t('home.benefits.premiumComfort.title')}</h3>
              <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors leading-relaxed">
                {t('home.benefits.premiumComfort.description')}
              </p>
            </div>

            {/* Global Access */}
            <div className="text-center group hover:scale-105 transition-all duration-300 p-5 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20">
              <div className="mb-4 flex justify-center">
                <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center group-hover:bg-amber-500 transition-all duration-300">
                  <MapPinIcon className="w-7 h-7 text-amber-400 group-hover:text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-100 transition-colors">{t('home.benefits.globalAccess.title')}</h3>
              <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors leading-relaxed">
                {t('home.benefits.globalAccess.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Inquiry Form Section */}
      <section id="inquiry-form" className="py-24 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('regularJetRequest.sectionTitle')}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t('regularJetRequest.sectionSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Image - Show on mobile at top, side by side on desktop */}
            <div className="relative h-64 sm:h-80 lg:h-full order-first">
              <img 
                src="/images/home/jet-interior.jpg" 
                alt="Luxury Jet Interior"
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 text-white">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">{t('regularJetRequest.sanctuaryTitle')}</h3>
                <p className="text-sm sm:text-base lg:text-lg text-gray-200">{t('regularJetRequest.sanctuarySubtitle')}</p>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <form onSubmit={handleFormSubmit} className="space-y-5 sm:space-y-6">
                {/* Personal Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('regularJetRequest.labels.name')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('regularJetRequest.labels.email')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('regularJetRequest.labels.phone')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Flight Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('regularJetRequest.labels.departure')}
                    </label>
                    <input
                      type="text"
                      name="departure"
                      value={formData.departure}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('regularJetRequest.labels.destination')}
                    </label>
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('regularJetRequest.labels.date')}
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('regularJetRequest.labels.passengers')}
                    </label>
                    <input
                      type="number"
                      name="passengers"
                      value={formData.passengers}
                      onChange={handleInputChange}
                      min="1"
                      max="20"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('regularJetRequest.labels.details')}
                  </label>
                  <textarea
                    name="details"
                    value={formData.details}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder={t('regularJetRequest.labels.detailsPlaceholder')}
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-amber-500 text-black py-3 px-6 rounded-lg font-semibold text-lg hover:bg-amber-600 transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                  {t('regularJetRequest.buttons.submit')}
                </button>

                {/* Privacy Disclaimer */}
                <p className="text-sm text-gray-500 text-center">
                  {t('regularJetRequest.privacy')}
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <Footer />

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center px-4 sm:px-6 z-50 overflow-y-auto py-6">
          <div className="max-w-md w-full my-auto">
            <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-amber-500/30 relative ring-1 ring-black/20">
              <button
                onClick={() => setShowSignupModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent mb-2">{t('auth.signup.title')}</h2>
                <p className="text-gray-300">{t('auth.signup.subtitle')}</p>
              </div>

              {/* Account Type Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 text-center">{t('auth.signup.accountTypeLabel')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAuthFormData({
                      ...authFormData, 
                      role: 'customer',
                      companyName: '' // Clear company name when switching to customer
                    })}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                      authFormData.role === 'customer' 
                        ? 'border-amber-500 bg-gradient-to-br from-amber-500/20 to-amber-600/10 shadow-xl transform scale-105' 
                        : 'border-gray-600 hover:border-amber-400/50 hover:bg-amber-500/5 hover:transform hover:scale-102'
                    }`}
                  >
                    <div className="mb-2">
                      <h4 className="text-white font-bold text-base mb-1">{t('auth.signup.customerLabel')}</h4>
                      <div className="w-10 h-0.5 bg-amber-500 mx-auto rounded-full"></div>
                    </div>
                    <p className="text-gray-300 text-xs leading-snug">{t('auth.signup.customerDescription')}</p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setAuthFormData({
                      ...authFormData, 
                      role: 'operator',
                      firstName: '', // Clear first name when switching to operator
                      lastName: ''   // Clear last name when switching to operator
                    })}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                      authFormData.role === 'operator' 
                        ? 'border-amber-500 bg-gradient-to-br from-amber-500/20 to-amber-600/10 shadow-xl transform scale-105' 
                        : 'border-gray-600 hover:border-amber-400/50 hover:bg-amber-500/5 hover:transform hover:scale-102'
                    }`}
                  >
                    <div className="mb-2">
                      <h4 className="text-white font-bold text-base mb-1">{t('auth.signup.operatorLabel')}</h4>
                      <div className="w-10 h-0.5 bg-amber-500 mx-auto rounded-full"></div>
                    </div>
                    <p className="text-gray-300 text-xs leading-snug">{t('auth.signup.operatorDescription')}</p>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSignup} className="space-y-6">
                {error && (
                  <div className="bg-red-500/30 border border-red-400/50 text-red-100 px-4 py-3 rounded-xl backdrop-blur-sm">
                    {error}
                  </div>
                )}
                
                {/* Dynamic fields based on role */}
                {authFormData.role === 'customer' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">{t('auth.signup.firstNameLabel')}</label>
                      <input
                        type="text"
                        name="firstName"
                        value={authFormData.firstName}
                        onChange={handleAuthInputChange}
                        className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-sm"
                        placeholder={t('auth.signup.firstNamePlaceholder')}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">{t('auth.signup.lastNameLabel')}</label>
                      <input
                        type="text"
                        name="lastName"
                        value={authFormData.lastName}
                        onChange={handleAuthInputChange}
                        className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-sm"
                        placeholder={t('auth.signup.lastNamePlaceholder')}
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">{t('auth.signup.operatorCompanyLabel')}</label>
                    <input
                      type="text"
                      name="companyName"
                      value={authFormData.companyName}
                      onChange={handleAuthInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-sm"
                      placeholder={t('auth.signup.operatorCompanyPlaceholder')}
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={authFormData.email}
                    onChange={handleAuthInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-sm"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-200 mb-2">{t('auth.signup.passwordLabel')}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={authFormData.password}
                      onChange={handleAuthInputChange}
                      autoComplete="new-password"
                      className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-sm"
                      placeholder={t('auth.signup.passwordPlaceholder')}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-amber-500 text-black py-3 px-4 rounded-xl font-semibold hover:bg-amber-600 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? t('auth.signup.creatingAccount') : t('auth.signup.createAccountButton')}
                </button>

                <div className="text-center">
                  <p className="text-gray-300">
                    {t('auth.signup.haveAccount')}{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setShowSignupModal(false);
                        setShowLoginModal(true);
                      }}
                      className="text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      {t('auth.signup.signIn')}
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center px-4 sm:px-6 z-50 overflow-y-auto py-6">
          <div className="max-w-md w-full my-auto">
            <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-amber-500/30 relative ring-1 ring-black/20">
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent mb-2">{t('auth.login.title')}</h2>
                <p className="text-gray-300">{t('auth.login.subtitle')}</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <div className="bg-red-500/30 border border-red-400/50 text-red-100 px-4 py-3 rounded-xl backdrop-blur-sm">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={authFormData.email}
                    onChange={handleAuthInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-sm"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-200 mb-2">{t('auth.login.passwordLabel')}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={authFormData.password}
                      onChange={handleAuthInputChange}
                      autoComplete="current-password"
                      className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-sm"
                      placeholder={t('auth.login.passwordPlaceholder')}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-amber-500 text-black py-3 px-4 rounded-xl font-semibold hover:bg-amber-600 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? t('auth.login.signingIn') : t('auth.login.signInButton')}
                </button>

                <div className="text-center">
                  <p className="text-gray-300">
                    {t('auth.login.noAccount')}{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setShowLoginModal(false);
                        setShowSignupModal(true);
                      }}
                      className="text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      {t('auth.login.signUp')}
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LuxuryLandingPage;
