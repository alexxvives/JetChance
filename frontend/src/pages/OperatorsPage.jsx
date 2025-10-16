import React from "react";
import { useTranslation } from "../contexts/TranslationContext";
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Wave from 'react-wavify';

export default function OperatorsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSignupRedirect = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-slate-800">
      <Navbar />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-16 sm:py-20">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/home/jet_fleet.jpg" 
            alt="Private Jet Fleet"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-800/85 to-slate-950/95"></div>
        </div>

        {/* Wave Overlay */}
        <div className="absolute inset-0 z-5 pointer-events-none">
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
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent leading-tight">
            {t('operators.hero.title')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4">
            {t('operators.hero.subtitle')}
          </p>
            <button 
              onClick={handleSignupRedirect}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-black px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-2xl"
            >
              {t('operators.hero.signupButton')}
            </button>
          </div>
        </section>
        {/* Benefits Section */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-slate-700 to-slate-800">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
                {t('operators.benefits.title')}
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto px-4">
                {t('operators.benefits.subtitle')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center p-6 sm:p-8 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:border-amber-500/30">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-amber-400/30">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-white">{t('operators.benefits.revenue.title')}</h3>
                <p className="text-white/70 text-sm sm:text-base md:text-lg">{t('operators.benefits.revenue.description')}</p>
              </div>
              
              <div className="text-center p-6 sm:p-8 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:border-amber-500/30">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-amber-400/30">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 01 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-white">{t('operators.benefits.clientele.title')}</h3>
                <p className="text-white/70 text-sm sm:text-base md:text-lg">{t('operators.benefits.clientele.description')}</p>
              </div>
              
              <div className="text-center p-6 sm:p-8 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:border-amber-500/30 sm:col-span-2 md:col-span-1">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-amber-400/30">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-white">{t('operators.benefits.operations.title')}</h3>
                <p className="text-white/70 text-sm sm:text-base md:text-lg">{t('operators.benefits.operations.description')}</p>
              </div>
            </div>
          </div>
        </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              {t('operators.howItWorks.title')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto px-4">
              {t('operators.howItWorks.subtitle')}
            </p>
          </div>
          
          {/* Steps with arrows - Roadmap style */}
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 lg:gap-4 relative">
              {/* Step 1 */}
              <div className="group backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 hover:border-amber-500/50 text-center hover:scale-105 hover:-translate-y-2 relative">
                {/* Arrow to next step - hidden on mobile, visible from sm */}
                <div className="hidden sm:block absolute top-1/2 -right-4 lg:-right-2 transform -translate-y-1/2 z-10">
                  <svg className="w-8 h-8 text-amber-500 animate-pulse" style={{ animationDelay: '0.5s' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-xl group-hover:shadow-amber-500/50 transition-all duration-500 group-hover:rotate-12" style={{ animation: 'pulse-subtle 3s ease-in-out infinite' }}>
                  <span className="text-2xl sm:text-3xl font-bold text-black">1</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white group-hover:text-amber-400 transition-colors duration-300">{t('operators.howItWorks.apply.title')}</h3>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed group-hover:text-white/90 transition-colors duration-300">{t('operators.howItWorks.apply.description')}</p>
              </div>
              
              {/* Step 2 */}
              <div className="group backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 hover:border-amber-500/50 text-center hover:scale-105 hover:-translate-y-2 relative">
                {/* Arrow to next step */}
                <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                  <svg className="w-8 h-8 text-amber-500 animate-pulse" style={{ animationDelay: '1s' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                {/* Arrow down on tablet */}
                <div className="hidden sm:block lg:hidden absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                  <svg className="w-8 h-8 text-amber-500 animate-pulse" style={{ animationDelay: '1s' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-xl group-hover:shadow-amber-500/50 transition-all duration-500 group-hover:rotate-12" style={{ animation: 'pulse-subtle 3s ease-in-out 1s infinite' }}>
                  <span className="text-2xl sm:text-3xl font-bold text-black">2</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white group-hover:text-amber-400 transition-colors duration-300">{t('operators.howItWorks.verify.title')}</h3>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed group-hover:text-white/90 transition-colors duration-300">{t('operators.howItWorks.verify.description')}</p>
              </div>
              
              {/* Step 3 */}
              <div className="group backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 hover:border-amber-500/50 text-center hover:scale-105 hover:-translate-y-2 relative">
                {/* Arrow to next step */}
                <div className="hidden sm:block absolute top-1/2 -right-4 lg:-right-2 transform -translate-y-1/2 z-10">
                  <svg className="w-8 h-8 text-amber-500 animate-pulse" style={{ animationDelay: '1.5s' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-xl group-hover:shadow-amber-500/50 transition-all duration-500 group-hover:rotate-12" style={{ animation: 'pulse-subtle 3s ease-in-out 2s infinite' }}>
                  <span className="text-2xl sm:text-3xl font-bold text-black">3</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white group-hover:text-amber-400 transition-colors duration-300">{t('operators.howItWorks.list.title')}</h3>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed group-hover:text-white/90 transition-colors duration-300">{t('operators.howItWorks.list.description')}</p>
              </div>
              
              {/* Step 4 - Final step */}
              <div className="group backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 hover:border-amber-500/50 text-center hover:scale-105 hover:-translate-y-2 relative">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-xl group-hover:shadow-green-500/50 transition-all duration-500 group-hover:rotate-12" style={{ animation: 'pulse-subtle 3s ease-in-out 2.5s infinite' }}>
                  <span className="text-2xl sm:text-3xl font-bold text-black">4</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white group-hover:text-green-400 transition-colors duration-300">{t('operators.howItWorks.earn.title')}</h3>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed group-hover:text-white/90 transition-colors duration-300">{t('operators.howItWorks.earn.description')}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Custom CSS for subtle pulse */}
        <style jsx>{`
          @keyframes pulse-subtle {
            0%, 100% {
              transform: scale(1);
              box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 25px 50px -12px rgb(251 191 36 / 0.5);
            }
          }
        `}</style>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            {t('operators.cta.title')}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-10 px-4">
            {t('operators.cta.subtitle')}
          </p>
          
          <div className="backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 shadow-lg border border-white/20">
            <div className="text-center">
              <h3 className="text-2xl sm:text-3xl font-semibold mb-3 sm:mb-4 text-white">
                {t('operators.signup.title')}
              </h3>
              <p className="text-white/80 text-sm sm:text-base md:text-lg mb-6 sm:mb-8">
                {t('operators.signup.subtitle')}
              </p>
              
              <button
                onClick={handleSignupRedirect}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-black px-8 sm:px-12 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-2xl transform hover:scale-105"
              >
                {t('operators.signup.button')}
              </button>
            </div>
          </div>
        </div>
        </section>
      <Footer />
    </div>
  );
}
