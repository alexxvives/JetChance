import React from "react";
import Orb from "../components/Orb";
import { useTranslation } from "../contexts/TranslationContext";

export default function OperatorsPage() {
  const { t } = useTranslation();
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
                  {t('operators.hero.title')}
                </h1>
                <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
                  {t('operators.hero.subtitle')}
                </p>
                <button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-violet-500 hover:to-purple-500 transition-all duration-300 shadow-2xl">
                  {t('operators.hero.button')}
                </button>
              </div>
            </section>
        {/* Benefits Section */}
        <section className="py-20 px-6 border-y border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t('operators.benefits.title')}
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                {t('operators.benefits.subtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-white/20">
                <div className="w-20 h-20 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-400/30">
                  <svg className="w-10 h-10 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">{t('operators.benefits.revenue.title')}</h3>
                <p className="text-white/70 text-lg">{t('operators.benefits.revenue.description')}</p>
              </div>
              
              <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-white/20">
                <div className="w-20 h-20 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-400/30">
                  <svg className="w-10 h-10 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">{t('operators.benefits.clientele.title')}</h3>
                <p className="text-white/70 text-lg">{t('operators.benefits.clientele.description')}</p>
              </div>
              
              <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-white/20">
                <div className="w-20 h-20 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-400/30">
                  <svg className="w-10 h-10 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">{t('operators.benefits.operations.title')}</h3>
                <p className="text-white/70 text-lg">{t('operators.benefits.operations.description')}</p>
              </div>
            </div>
          </div>
        </section>

      {/* How It Works Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('operators.howItWorks.title')}
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              {t('operators.howItWorks.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-white/20 text-center">
              <div className="w-20 h-20 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 border border-violet-400/30 mx-auto">
                <span className="text-2xl font-bold text-violet-300">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">{t('operators.howItWorks.apply.title')}</h3>
              <p className="text-white/70 text-lg leading-relaxed">{t('operators.howItWorks.apply.description')}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-white/20 text-center">
              <div className="w-20 h-20 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 border border-violet-400/30 mx-auto">
                <span className="text-2xl font-bold text-violet-300">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">{t('operators.howItWorks.verify.title')}</h3>
              <p className="text-white/70 text-lg leading-relaxed">{t('operators.howItWorks.verify.description')}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-white/20 text-center">
              <div className="w-20 h-20 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 border border-violet-400/30 mx-auto">
                <span className="text-2xl font-bold text-violet-300">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">{t('operators.howItWorks.list.title')}</h3>
              <p className="text-white/70 text-lg leading-relaxed">{t('operators.howItWorks.list.description')}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-white/20 text-center">
              <div className="w-20 h-20 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 border border-violet-400/30 mx-auto">
                <span className="text-2xl font-bold text-violet-300">4</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">{t('operators.howItWorks.earn.title')}</h3>
              <p className="text-white/70 text-lg leading-relaxed">{t('operators.howItWorks.earn.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('operators.cta.title')}
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('operators.cta.subtitle')}
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-white/20">
            <h3 className="text-3xl font-semibold mb-6 text-white">{t('operators.cta.cardTitle')}</h3>
            <p className="text-white/80 text-lg leading-relaxed mb-8">
              {t('operators.cta.cardSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-violet-500 hover:to-purple-500 transition-all duration-300 shadow-2xl">
                {t('operators.cta.applyButton')}
              </button>
              <button className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-white/30">
                {t('operators.cta.scheduleButton')}
              </button>
            </div>
          </div>
        </div>
      </section>
        </div>
      </div>
    </div>
  );
}
