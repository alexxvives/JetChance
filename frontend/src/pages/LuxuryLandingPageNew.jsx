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
      <section className="relative min-h-[125vh] flex items-start justify-center pt-20 overflow-hidden">
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
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-8">
          {/* Logo */}
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <img 
              src="/images/logo/logo3.svg" 
              alt="JetChance Logo" 
              className="w-[403px] h-auto mx-auto block"
            />
          </div>

          {/* Headline */}
          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight m-0">
              <span className="text-white">{t('home.hero.headline.whatIf')}</span>
              <span className="text-amber-500">{t('home.hero.headline.private')}</span>
              <br />
              <span className="text-white">{t('home.hero.headline.wasAccessible')}</span>
              <span className="text-amber-500">{t('home.hero.headline.commercial')}</span>
              <span className="text-white">{t('home.hero.headline.ticket')}</span>
            </h1>
          </div>

          {/* Subheadline */}
          <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t('home.hero.subtitle')}
            </p>
          </div>

          {/* Dual CTAs */}
          <div className="mb-12 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <button 
              onClick={navigateToSignup}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-lg text-lg font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              {t('home.hero.cta.emptyLeg')}
            </button>
            <button 
              onClick={scrollToForm}
              className="px-8 py-4 bg-amber-500 text-black rounded-lg text-lg font-semibold hover:bg-amber-600 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              {t('home.hero.cta.fullCharter')}
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mb-16 animate-fade-in-up" style={{ animationDelay: '1s' }}>
            <div className="flex items-center justify-center gap-4 sm:gap-8 text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-sm sm:text-base">{t('home.hero.trust.safety')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-sm sm:text-base">{t('home.hero.trust.concierge')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-sm sm:text-base">{t('home.hero.trust.booking')}</span>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full mx-auto">
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
          <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-8 max-w-6xl mx-auto">
            {/* Empty Leg Card */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden border-2 border-green-200" style={{minHeight: 'clamp(200px, 50vw, 400px)'}}>
              <div className="relative flex flex-col justify-between h-full" style={{padding: 'clamp(0.5rem, 3vw, 2rem)'}}>
                {/* Badge - Top Right */}
                <div className="absolute" style={{top: 'clamp(0.25rem, 2vw, 1rem)', right: 'clamp(0.25rem, 2vw, 1rem)'}}>
                  <div className="bg-green-500 text-white rounded-full font-semibold flex items-center" style={{padding: 'clamp(0.125rem, 1vw, 0.25rem) clamp(0.25rem, 2vw, 0.75rem)', fontSize: 'clamp(0.75rem, 3vw, 0.875rem)', gap: 'clamp(0.125rem, 1vw, 0.25rem)'}}>
                    <ArrowTrendingDownIcon style={{width: 'clamp(0.5rem, 2vw, 1rem)', height: 'clamp(0.5rem, 2vw, 1rem)'}} />
                    <span className="hidden xs:inline">{t('home.services.emptyLeg.badge')}</span>
                    <span className="xs:hidden">-90%</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 flex items-center" style={{fontSize: 'clamp(0.875rem, 4vw, 1.5rem)', marginBottom: 'clamp(0.25rem, 1vw, 0.5rem)', marginTop: 'clamp(1.5rem, 6vw, 0.5rem)', gap: 'clamp(0.25rem, 2vw, 0.75rem)'}}>
                  <PaperAirplaneIcon className="text-amber-500" style={{width: 'clamp(1rem, 4vw, 2rem)', height: 'clamp(1rem, 4vw, 2rem)'}} />
                  <span style={{fontSize: 'clamp(0.75rem, 4vw, 1.5rem)'}}>{t('home.services.emptyLeg.title')}</span>
                </h3>
                <p className="text-gray-600" style={{fontSize: 'clamp(0.75rem, 3vw, 0.875rem)', marginBottom: 'clamp(0.5rem, 2vw, 1.5rem)', lineHeight: '1.3'}}>
                  {t('home.services.emptyLeg.description')}
                </p>

                {/* Perfect for */}
                <div className="mb-2 sm:mb-6 h-28 sm:h-auto">
                  <h4 className="text-xs sm:text-base lg:text-lg font-semibold text-gray-800 mb-0.5 sm:mb-3">{t('home.services.emptyLeg.perfectFor')}</h4>
                  <ul style={{marginTop: 'clamp(0.25rem, 1vw, 0.5rem)'}}>
                    <li className="flex items-center text-gray-600" style={{fontSize: 'clamp(0.75rem, 3vw, 1rem)', gap: 'clamp(0.25rem, 1vw, 0.5rem)', marginBottom: 'clamp(0.125rem, 0.5vw, 0.5rem)', lineHeight: '1.2'}}>
                      <CheckIcon className="text-green-500" style={{width: 'clamp(0.75rem, 3vw, 1.25rem)', height: 'clamp(0.75rem, 3vw, 1.25rem)', flexShrink: 0}} />
                      {t('home.services.emptyLeg.benefits.0')}
                    </li>
                    <li className="flex items-center text-gray-600" style={{fontSize: 'clamp(0.75rem, 3vw, 1rem)', gap: 'clamp(0.25rem, 1vw, 0.5rem)', marginBottom: 'clamp(0.125rem, 0.5vw, 0.5rem)', lineHeight: '1.2'}}>
                      <CheckIcon className="text-green-500" style={{width: 'clamp(0.75rem, 3vw, 1.25rem)', height: 'clamp(0.75rem, 3vw, 1.25rem)', flexShrink: 0}} />
                      {t('home.services.emptyLeg.benefits.1')}
                    </li>
                    <li className="flex items-center text-gray-600" style={{fontSize: 'clamp(0.75rem, 3vw, 1rem)', gap: 'clamp(0.25rem, 1vw, 0.5rem)', lineHeight: '1.2'}}>
                      <CheckIcon className="text-green-500" style={{width: 'clamp(0.75rem, 3vw, 1.25rem)', height: 'clamp(0.75rem, 3vw, 1.25rem)', flexShrink: 0}} />
                      {t('home.services.emptyLeg.benefits.2')}
                    </li>
                  </ul>
                </div>

                {/* Divisor */}
                <div className="border-t border-gray-200 mb-2 sm:mb-6 hidden md:block"></div>

                {/* What you get */}
                <div className="mb-2 sm:mb-6 h-16 sm:h-auto hidden md:block">
                  <h4 className="text-xs sm:text-base lg:text-lg font-semibold text-gray-800 mb-0.5 sm:mb-3">{t('home.services.emptyLeg.whatYouGet')}</h4>
                  <p className="text-gray-600 text-xs sm:text-sm leading-none sm:leading-normal">
                    {t('home.services.emptyLeg.details')}
                  </p>
                </div>
              </div>
            </div>

            {/* Full Charter Card */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden border-2 border-black" style={{minHeight: 'clamp(200px, 50vw, 400px)'}}>
              <div className="relative flex flex-col justify-between h-full" style={{padding: 'clamp(0.5rem, 3vw, 2rem)'}}>
                {/* Badge - Top Right */}
                <div className="absolute" style={{top: 'clamp(0.25rem, 2vw, 1rem)', right: 'clamp(0.25rem, 2vw, 1rem)'}}>
                  <div className="bg-black text-white rounded-full font-semibold flex items-center" style={{padding: 'clamp(0.125rem, 1vw, 0.25rem) clamp(0.25rem, 2vw, 0.75rem)', fontSize: 'clamp(0.75rem, 3vw, 0.875rem)', gap: 'clamp(0.125rem, 1vw, 0.25rem)'}}>
                    <span className="hidden sm:inline">{t('home.services.fullCharter.badge')}</span>
                    <span className="sm:hidden">{t('home.services.fullCharter.badge')}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 flex items-center" style={{fontSize: 'clamp(0.875rem, 4vw, 1.5rem)', marginBottom: 'clamp(0.25rem, 1vw, 0.5rem)', marginTop: 'clamp(1.5rem, 6vw, 0.5rem)', gap: 'clamp(0.25rem, 2vw, 0.75rem)'}}>
                  <CalendarIcon className="text-amber-500" style={{width: 'clamp(1rem, 4vw, 2rem)', height: 'clamp(1rem, 4vw, 2rem)'}} />
                  <span style={{fontSize: 'clamp(0.75rem, 4vw, 1.5rem)'}}>{t('home.services.fullCharter.title')}</span>
                </h3>
                <p className="text-gray-600" style={{fontSize: 'clamp(0.75rem, 3vw, 0.875rem)', marginBottom: 'clamp(0.5rem, 2vw, 1.5rem)', lineHeight: '1.3'}}>
                  {t('home.services.fullCharter.description')}
                </p>

                {/* Perfect for */}
                <div className="mb-2 sm:mb-6 h-28 sm:h-auto">
                  <h4 className="text-xs sm:text-base lg:text-lg font-semibold text-gray-800 mb-0.5 sm:mb-3">{t('home.services.fullCharter.perfectFor')}</h4>
                  <ul style={{marginTop: 'clamp(0.25rem, 1vw, 0.5rem)'}}>
                    <li className="flex items-center text-gray-600" style={{fontSize: 'clamp(0.75rem, 3vw, 1rem)', gap: 'clamp(0.25rem, 1vw, 0.5rem)', marginBottom: 'clamp(0.125rem, 0.5vw, 0.5rem)', lineHeight: '1.2'}}>
                      <CheckIcon className="text-green-500" style={{width: 'clamp(0.75rem, 3vw, 1.25rem)', height: 'clamp(0.75rem, 3vw, 1.25rem)', flexShrink: 0}} />
                      {t('home.services.fullCharter.benefits.0')}
                    </li>
                    <li className="flex items-center text-gray-600" style={{fontSize: 'clamp(0.75rem, 3vw, 1rem)', gap: 'clamp(0.25rem, 1vw, 0.5rem)', marginBottom: 'clamp(0.125rem, 0.5vw, 0.5rem)', lineHeight: '1.2'}}>
                      <CheckIcon className="text-green-500" style={{width: 'clamp(0.75rem, 3vw, 1.25rem)', height: 'clamp(0.75rem, 3vw, 1.25rem)', flexShrink: 0}} />
                      {t('home.services.fullCharter.benefits.1')}
                    </li>
                    <li className="flex items-center text-gray-600" style={{fontSize: 'clamp(0.75rem, 3vw, 1rem)', gap: 'clamp(0.25rem, 1vw, 0.5rem)', lineHeight: '1.2'}}>
                      <CheckIcon className="text-green-500" style={{width: 'clamp(0.75rem, 3vw, 1.25rem)', height: 'clamp(0.75rem, 3vw, 1.25rem)', flexShrink: 0}} />
                      {t('home.services.fullCharter.benefits.2')}
                    </li>
                  </ul>
                </div>

                {/* Divisor */}
                <div className="border-t border-gray-200 mb-2 sm:mb-6 hidden md:block"></div>

                {/* What you get */}
                <div className="mb-2 sm:mb-6 h-16 sm:h-auto hidden md:block">
                  <h4 className="text-xs sm:text-base lg:text-lg font-semibold text-gray-800 mb-0.5 sm:mb-3">{t('home.services.fullCharter.whatYouGet')}</h4>
                  <p className="text-gray-600 text-xs sm:text-sm leading-none sm:leading-normal">
                    {t('home.services.fullCharter.details')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Benefits Section */}
      <section className="py-24 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              The Private Jet Advantage
            </h2>
          </div>

          {/* 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Safety First */}
            <div className="text-center group hover:scale-105 transition-all duration-300 p-6 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center group-hover:bg-amber-500 transition-all duration-300">
                  <ShieldCheckIcon className="w-8 h-8 text-amber-400 group-hover:text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-100 transition-colors">Safety First</h3>
              <p className="text-gray-300 group-hover:text-gray-200 transition-colors">
                Rigorous safety standards with certified operators and maintained aircraft
              </p>
            </div>

            {/* Time Efficient */}
            <div className="text-center group hover:scale-105 transition-all duration-300 p-6 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center group-hover:bg-amber-500 transition-all duration-300">
                  <ClockIcon className="w-8 h-8 text-amber-400 group-hover:text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-100 transition-colors">Time Efficient</h3>
              <p className="text-gray-300 group-hover:text-gray-200 transition-colors">
                Skip the airport hassles, arrive 15 minutes before departure
              </p>
            </div>

            {/* Premium Comfort */}
            <div className="text-center group hover:scale-105 transition-all duration-300 p-6 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center group-hover:bg-amber-500 transition-all duration-300">
                  <StarIcon className="w-8 h-8 text-amber-400 group-hover:text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-100 transition-colors">Premium Comfort</h3>
              <p className="text-gray-300 group-hover:text-gray-200 transition-colors">
                Luxury amenities, spacious cabins, and personalized service
              </p>
            </div>

            {/* Global Access */}
            <div className="text-center group hover:scale-105 transition-all duration-300 p-6 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center group-hover:bg-amber-500 transition-all duration-300">
                  <MapPinIcon className="w-8 h-8 text-amber-400 group-hover:text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-100 transition-colors">Global Access</h3>
              <p className="text-gray-300 group-hover:text-gray-200 transition-colors">
                Access to thousands of airports worldwide, reaching destinations airlines can't
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

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Image */}
            <div className="relative h-full">
              <img 
                src="/images/home/jet-interior.jpg" 
                alt="Luxury Jet Interior"
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="text-3xl font-bold mb-2">{t('regularJetRequest.sanctuaryTitle')}</h3>
                <p className="text-lg text-gray-200">{t('regularJetRequest.sanctuarySubtitle')}</p>
              </div>
            </div>

            {/* Right: Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('regularJetRequest.labels.name')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('regularJetRequest.labels.email')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('regularJetRequest.labels.phone')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Flight Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('regularJetRequest.labels.departure')}
                    </label>
                    <input
                      type="text"
                      name="departure"
                      value={formData.departure}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('regularJetRequest.labels.destination')}
                    </label>
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('regularJetRequest.labels.date')}
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('regularJetRequest.labels.passengers')}
                    </label>
                    <input
                      type="number"
                      name="passengers"
                      value={formData.passengers}
                      onChange={handleInputChange}
                      min="1"
                      max="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center px-6 z-50">
          <div className="max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 backdrop-blur-2xl rounded-2xl shadow-2xl p-8 border border-amber-500/30 relative ring-1 ring-black/20">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center px-6 z-50">
          <div className="max-w-md w-full">
            <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 backdrop-blur-2xl rounded-2xl shadow-2xl p-8 border border-amber-500/30 relative ring-1 ring-black/20">
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
