import React from "react";
import { useTranslation } from "../contexts/TranslationContext";

export default function OperatorsPage() {
  const { t } = useTranslation();

  const scrollToForm = () => {
    const formSection = document.getElementById('operator-form');
    if (formSection) {
      formSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="relative bg-slate-900">
      {/* Content */}
      <div className="relative z-10">
        <div className="relative">
          {/* Hero Section */}
          <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
              <img 
                src="/images/home/jet_fleet.jpg" 
                alt="Private Jet Fleet"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-800/85 to-slate-950/95"></div>
            </div>
            
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <h1 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent leading-tight">
                {t('operators.hero.title')}
              </h1>
              <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
                {t('operators.hero.subtitle')}
              </p>
                <button 
                  onClick={scrollToForm}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-black px-8 py-4 rounded-xl text-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-2xl"
                >
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
              <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-amber-500/10 hover:border-amber-500/20">
                <div className="w-20 h-20 bg-amber-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-400/30">
                  <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">{t('operators.benefits.revenue.title')}</h3>
                <p className="text-white/70 text-lg">{t('operators.benefits.revenue.description')}</p>
              </div>
              
              <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-amber-500/10 hover:border-amber-500/20">
                <div className="w-20 h-20 bg-amber-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-400/30">
                  <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 01 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">{t('operators.benefits.clientele.title')}</h3>
                <p className="text-white/70 text-lg">{t('operators.benefits.clientele.description')}</p>
              </div>
              
              <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-amber-500/10 hover:border-amber-500/20">
                <div className="w-20 h-20 bg-amber-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-400/30">
                  <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-amber-500/10 hover:border-amber-500/20 text-center">
              <div className="w-20 h-20 bg-amber-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 border border-amber-400/30 mx-auto">
                <span className="text-2xl font-bold text-amber-400">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">{t('operators.howItWorks.apply.title')}</h3>
              <p className="text-white/70 text-lg leading-relaxed">{t('operators.howItWorks.apply.description')}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-amber-500/10 hover:border-amber-500/20 text-center">
              <div className="w-20 h-20 bg-amber-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 border border-amber-400/30 mx-auto">
                <span className="text-2xl font-bold text-amber-400">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">{t('operators.howItWorks.verify.title')}</h3>
              <p className="text-white/70 text-lg leading-relaxed">{t('operators.howItWorks.verify.description')}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-amber-500/10 hover:border-amber-500/20 text-center">
              <div className="w-20 h-20 bg-amber-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 border border-amber-400/30 mx-auto">
                <span className="text-2xl font-bold text-amber-400">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">{t('operators.howItWorks.list.title')}</h3>
              <p className="text-white/70 text-lg leading-relaxed">{t('operators.howItWorks.list.description')}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-amber-500/10 hover:border-amber-500/20 text-center">
              <div className="w-20 h-20 bg-amber-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 border border-amber-400/30 mx-auto">
                <span className="text-2xl font-bold text-amber-400">4</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">{t('operators.howItWorks.earn.title')}</h3>
              <p className="text-white/70 text-lg leading-relaxed">{t('operators.howItWorks.earn.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="operator-form" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('operators.cta.title')}
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              {t('operators.cta.subtitle')}
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-lg border border-white/20">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-semibold mb-4 text-white">{t('operators.applicationForm.title')}</h3>
              <p className="text-white/80 text-lg">
                {t('operators.applicationForm.subtitle')}
              </p>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Name */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    {t('operators.applicationForm.companyName.label')} *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    placeholder={t('operators.applicationForm.companyName.placeholder')}
                  />
                </div>

                {/* Contact Name */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    {t('operators.applicationForm.contactName.label')} *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    placeholder={t('operators.applicationForm.contactName.placeholder')}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    {t('operators.applicationForm.email.label')} *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    placeholder={t('operators.applicationForm.email.placeholder')}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    {t('operators.applicationForm.phone.label')} *
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    placeholder={t('operators.applicationForm.phone.placeholder')}
                  />
                </div>

                {/* Fleet Size */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    {t('operators.applicationForm.fleetSize.label')} *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    placeholder={t('operators.applicationForm.fleetSize.placeholder')}
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    {t('operators.applicationForm.experience.label')} *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    placeholder={t('operators.applicationForm.experience.placeholder')}
                  />
                </div>
              </div>

              {/* Operating Regions */}
              <div>
                <label className="block text-white font-medium mb-2">
                  {t('operators.applicationForm.operatingRegions.label')} *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  placeholder={t('operators.applicationForm.operatingRegions.placeholder')}
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-white font-medium mb-2">
                  {t('operators.applicationForm.message.label')}
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors resize-none"
                  placeholder={t('operators.applicationForm.message.placeholder')}
                ></textarea>
              </div>

              {/* Required Fields Note */}
              <p className="text-amber-300 text-sm">
                * {t('operators.applicationForm.required')}
              </p>

              {/* Submit Button */}
              <div className="text-center pt-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-black px-12 py-4 rounded-xl text-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-2xl transform hover:scale-105"
                >
                  {t('operators.applicationForm.submitButton')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
        </div>
      </div>
    </div>
  );
}
