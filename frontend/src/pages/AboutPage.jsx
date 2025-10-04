import React from "react";
import { useTranslation } from '../contexts/TranslationContext';
import ProfileCard from '../components/ProfileCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const customStyles = `
  .dark-profile-card .pc-inside {
    background-color: rgba(15, 23, 42, 0.95) !important;
  }
  
  .dark-profile-card .pc-card {
    background-blend-mode: multiply, normal, normal, normal !important;
  }
  
  .dark-profile-card .pc-shine {
    filter: brightness(0.4) contrast(1.8) saturate(0.8) opacity(0.7) !important;
    mask-size: 200% !important;
    mask-position: center !important;
  }
  
  .dark-profile-card:hover .pc-shine,
  .dark-profile-card.active .pc-shine {
    filter: brightness(0.6) contrast(2) saturate(1) opacity(0.9) !important;
  }
  
  .dark-profile-card .pc-details {
    transform: translateY(-15px) !important;
    gap: 8px !important;
  }
  
  .dark-profile-card .pc-details h3 {
    font-size: min(4svh, 2.2em) !important;
    line-height: 1.1 !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    background-image: linear-gradient(to bottom, #ffffff, #e2e8f0) !important;
    -webkit-text-fill-color: transparent !important;
    background-clip: text !important;
    -webkit-background-clip: text !important;
    margin-bottom: 5px !important;
  }
  
  .dark-profile-card .pc-details p {
    color: rgba(226, 232, 240, 0.8) !important;
    margin-top: 0px !important;
  }
  
  .dark-profile-card .pc-user-info {
    background: rgba(15, 23, 42, 0.6) !important;
    backdrop-filter: blur(10px) !important;
  }
  
  .dark-profile-card .pc-contact-btn {
    background: rgba(71, 85, 105, 0.8) !important;
    color: white !important;
    border: 1px solid rgba(148, 163, 184, 0.3) !important;
  }
  
  .dark-profile-card .pc-contact-btn:hover {
    background: rgba(100, 116, 139, 0.9) !important;
  }
`;

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
    <div className="min-h-screen bg-slate-800">
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <Navbar />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/home/controls.png" 
            alt="Aircraft Controls"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-800/85 to-slate-950/95"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent leading-tight">
            {renderTitle()}
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
            {t('about.hero.subtitle')}
          </p>
        </div>
      </section>
        {/* Mission Section */}
        <section className="py-20 px-6 bg-gradient-to-b from-slate-700 to-slate-800">
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
            <div className="backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:border-amber-500/30">
              <div className="text-center">
                <div className="text-6xl font-bold text-amber-300 mb-2">{t('about.mission.stats.savings')}</div>
                <p className="text-white text-lg font-semibold">{t('about.mission.stats.savingsLabel')}</p>
                <p className="text-white/80 mt-2">{t('about.mission.stats.savingsDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-slate-800 to-slate-900">
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
            <div className="text-center p-8 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:border-amber-500/30">
              <div className="w-20 h-20 bg-amber-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-400/30">
                <svg className="w-8 h-8 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">{t('about.values.customerFirst.title')}</h3>
              <p className="text-white/70 text-lg">{t('about.values.customerFirst.description')}</p>
            </div>
            
            <div className="text-center p-8 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:border-amber-500/30">
              <div className="w-20 h-20 bg-amber-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-400/30">
                <svg className="w-8 h-8 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">{t('about.values.innovation.title')}</h3>
              <p className="text-white/70 text-lg">{t('about.values.innovation.description')}</p>
            </div>
            
            <div className="text-center p-8 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:border-amber-500/30">
              <div className="w-20 h-20 bg-amber-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-400/30">
                <svg className="w-8 h-8 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <section className="py-20 px-6 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('about.team.title')}
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              {t('about.team.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-20 px-4">
            <ProfileCard
              name="Sebastian Vives"
              title="Software Engineer"
              handle="sebastianvives"
              status="Online"
              contactText="Contact Me"
              avatarUrl="/images/home/sebas.png"
              iconUrl="/images/logos/jetchance-logo-white.svg"
              behindGradient="radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y), hsla(220, 60%, 25%, var(--card-opacity)) 4%, hsla(220, 40%, 20%, calc(var(--card-opacity)*0.75)) 10%, hsla(220, 20%, 15%, calc(var(--card-opacity)*0.5)) 50%, hsla(220, 0%, 10%, 0) 100%), linear-gradient(135deg, #1e293b 0%, #334155 30%, #475569 50%, #334155 70%, #1e293b 100%)"
              innerGradient="linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 30%, rgba(71, 85, 105, 0.8) 50%, rgba(30, 41, 59, 0.85) 70%, rgba(15, 23, 42, 0.95) 100%)"
              showBehindGradient={true}
              showUserInfo={true}
              enableTilt={true}
              enableMobileTilt={false}
              className="dark-profile-card"
              onContactClick={() => console.log('Contact clicked')}
            />
            
            <ProfileCard
              name="Leonardo Herrera"
              title="CEO & Founder"
              handle="leonardoherrera"
              status="Online"
              contactText="Contact Me"
              avatarUrl="/images/home/leo.jpg"
              iconUrl="/images/logos/jetchance-logo-white.svg"
              behindGradient="radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y), hsla(220, 60%, 25%, var(--card-opacity)) 4%, hsla(220, 40%, 20%, calc(var(--card-opacity)*0.75)) 10%, hsla(220, 20%, 15%, calc(var(--card-opacity)*0.5)) 50%, hsla(220, 0%, 10%, 0) 100%), linear-gradient(135deg, #1e293b 0%, #334155 30%, #475569 50%, #334155 70%, #1e293b 100%)"
              innerGradient="linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 30%, rgba(71, 85, 105, 0.8) 50%, rgba(30, 41, 59, 0.85) 70%, rgba(15, 23, 42, 0.95) 100%)"
              showBehindGradient={true}
              showUserInfo={true}
              enableTilt={true}
              enableMobileTilt={false}
              className="dark-profile-card"
              onContactClick={() => console.log('Contact clicked')}
            />
            
            <ProfileCard
              name="Juan Carlos Contreras"
              title="Operations Director"
              handle="juancarloscontreras"
              status="Online"
              contactText="Contact Me"
              avatarUrl="/images/backgrounds/juanca.jpg"
              iconUrl="/images/logos/jetchance-logo-white.svg"
              behindGradient="radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y), hsla(220, 60%, 25%, var(--card-opacity)) 4%, hsla(220, 40%, 20%, calc(var(--card-opacity)*0.75)) 10%, hsla(220, 20%, 15%, calc(var(--card-opacity)*0.5)) 50%, hsla(220, 0%, 10%, 0) 100%), linear-gradient(135deg, #1e293b 0%, #334155 30%, #475569 50%, #334155 70%, #1e293b 100%)"
              innerGradient="linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 30%, rgba(71, 85, 105, 0.8) 50%, rgba(30, 41, 59, 0.85) 70%, rgba(15, 23, 42, 0.95) 100%)"
              showBehindGradient={true}
              showUserInfo={true}
              enableTilt={true}
              enableMobileTilt={false}
              className="dark-profile-card"
              onContactClick={() => console.log('Contact clicked')}
            />
            
            <ProfileCard
              name="Alexandre Vives"
              title="Head of Aviation"
              handle="alexandrevives"
              status="Online"
              contactText="Contact Me"
              avatarUrl="/images/home/alex.png"
              iconUrl="/images/logos/jetchance-logo-white.svg"
              behindGradient="radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y), hsla(220, 60%, 25%, var(--card-opacity)) 4%, hsla(220, 40%, 20%, calc(var(--card-opacity)*0.75)) 10%, hsla(220, 20%, 15%, calc(var(--card-opacity)*0.5)) 50%, hsla(220, 0%, 10%, 0) 100%), linear-gradient(135deg, #1e293b 0%, #334155 30%, #475569 50%, #334155 70%, #1e293b 100%)"
              innerGradient="linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 30%, rgba(71, 85, 105, 0.8) 50%, rgba(30, 41, 59, 0.85) 70%, rgba(15, 23, 42, 0.95) 100%)"
              showBehindGradient={true}
              showUserInfo={true}
              enableTilt={true}
              enableMobileTilt={false}
              className="dark-profile-card"
              onContactClick={() => console.log('Contact clicked')}
            />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
