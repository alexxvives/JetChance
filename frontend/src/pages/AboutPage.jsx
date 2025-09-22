import React from "react";
import { useTranslation } from '../contexts/TranslationContext';
import Orb from "../components/Orb";

export default function AboutPage() {
  const { t, currentLanguage } = useTranslation();
  
  // Function to render title with line breaks for Spanish
  const renderTitle = () => {
    const title = t('about.hero.title');
    if (currentLanguage === 'es' && title.includes('\n')) {
      return title.split('\n').map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < title.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
    }
    return title;
  };
  
  return (
    <div className="relative bg-gradient-to-br from-black via-black to-violet-900/30">
      {/* Background Orb - Scrolls with content */}
      <div className="absolute inset-0 z-0 pointer-events-auto" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh' }}>
        <Orb
          hoverIntensity={1}
          rotateOnHover={true}
          hue={280}
          forceHoverState={false}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 pointer-events-none">
        <div className="pointer-events-auto">
          {/* Hero Section */}
          <section className="min-h-screen flex items-center justify-center px-6 py-20">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent leading-tight">
                  {renderTitle()}
                </h1>
                <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
                  {t('about.hero.subtitle')}
                </p>
              </div>
            </section>
        {/* Mission Section */}
        <section className="py-20 px-6 border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('about.mission.title')}
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              {t('about.mission.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-semibold mb-6 text-white">{t('about.mission.breaking.title')}</h3>
              <p className="text-white/80 text-lg leading-relaxed mb-6">
                {t('about.mission.breaking.description1')}
              </p>
              <p className="text-white/80 text-lg leading-relaxed">
                {t('about.mission.breaking.description2')}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-white/20">
              <div className="text-center">
                <div className="text-6xl font-bold text-violet-300 mb-2">{t('about.mission.stats.savings')}</div>
                <p className="text-white text-lg font-semibold">{t('about.mission.stats.savingsLabel')}</p>
                <p className="text-white/80 mt-2">{t('about.mission.stats.savingsDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('about.values.title')}
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              {t('about.values.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-white/20">
              <div className="w-20 h-20 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-400/30">
                <svg className="w-8 h-8 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">{t('about.values.customerFirst.title')}</h3>
              <p className="text-white/70 text-lg">{t('about.values.customerFirst.description')}</p>
            </div>
            
            <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-white/20">
              <div className="w-20 h-20 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-400/30">
                <svg className="w-8 h-8 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">{t('about.values.innovation.title')}</h3>
              <p className="text-white/70 text-lg">{t('about.values.innovation.description')}</p>
            </div>
            
            <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-white/20">
              <div className="w-20 h-20 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-400/30">
                <svg className="w-8 h-8 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">{t('about.values.trustSafety.title')}</h3>
              <p className="text-white/70 text-lg">{t('about.values.trustSafety.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('about.team.title')}
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('about.team.subtitle')}
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-white/20">
            <h3 className="text-3xl font-semibold mb-6 text-white">{t('about.cta.title')}</h3>
            <p className="text-white/80 text-lg leading-relaxed mb-8">
              {t('about.cta.subtitle')}
            </p>
            <button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-violet-500 hover:to-purple-500 transition-all duration-300 shadow-2xl">
              {t('about.cta.getStarted')}
            </button>
          </div>
        </div>
      </section>
        </div>
      </div>
    </div>
  );
}
