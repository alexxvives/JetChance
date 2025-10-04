import React from "react";
import { useTranslation } from "../contexts/TranslationContext";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-800">
      <Navbar />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/home/contact.jpeg" 
            alt="Contact JetChance"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-800/85 to-slate-950/95"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent leading-tight">
            {t('contact.hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
            {t('contact.hero.subtitle')}
          </p>
        </div>
      </section>

            {/* Contact Options Section */}
            <section className="py-20 px-6 bg-gradient-to-b from-slate-700 to-slate-800">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    {t('contact.options.title')}
                  </h2>
                  <p className="text-xl text-white/80 max-w-3xl mx-auto">
                    {t('contact.options.subtitle')}
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:border-amber-500/30 text-center">
                    <div className="w-20 h-20 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-400/30">
                      <svg className="w-10 h-10 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold mb-4 text-white">{t('contact.options.call.title')}</h3>
                    <p className="text-white/70 text-lg mb-4">{t('contact.options.call.description')}</p>
                    <p className="text-amber-300 text-lg font-semibold">{t('contact.options.call.number')}</p>
                  </div>
                  
                  <div className="backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:border-amber-500/30 text-center">
                    <div className="w-20 h-20 bg-amber-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-400/30">
                      <svg className="w-10 h-10 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold mb-4 text-white">{t('contact.options.email.title')}</h3>
                    <p className="text-white/70 text-lg mb-4">{t('contact.options.email.description')}</p>
                    <p className="text-amber-300 text-lg font-semibold">{t('contact.options.email.address')}</p>
                  </div>
                  
                  <div className="backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:border-amber-500/30 text-center">
                    <div className="w-20 h-20 bg-amber-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-400/30">
                      <svg className="w-10 h-10 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold mb-4 text-white">{t('contact.options.chat.title')}</h3>
                    <p className="text-white/70 text-lg mb-4">{t('contact.options.chat.description')}</p>
                    <button className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-500 transition-colors">
                      {t('contact.options.chat.button')}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Form Section */}
            <section className="py-20 px-6 bg-gradient-to-b from-slate-800 to-slate-900">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    {t('contact.form.title')}
                  </h2>
                  <p className="text-xl text-white/80 max-w-3xl mx-auto">
                    {t('contact.form.subtitle')}
                  </p>
                </div>
                
                <div className="backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">{t('contact.form.firstName')}</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-amber-400"
                          placeholder={t('contact.form.placeholders.firstName')}
                        />
                      </div>
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">{t('contact.form.lastName')}</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-amber-400"
                          placeholder={t('contact.form.placeholders.lastName')}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">{t('contact.form.email')}</label>
                      <input 
                        type="email" 
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-amber-400"
                        placeholder={t('contact.form.placeholders.email')}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">{t('contact.form.subject')}</label>
                      <select className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:border-amber-400">
                        <option value="">{t('contact.form.placeholders.subject')}</option>
                        <option value="booking">{t('contact.form.subjects.booking')}</option>
                        <option value="support">{t('contact.form.subjects.support')}</option>
                        <option value="partnership">{t('contact.form.subjects.partnership')}</option>
                        <option value="other">{t('contact.form.subjects.other')}</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">{t('contact.form.message')}</label>
                      <textarea 
                        rows={4}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-amber-400"
                        placeholder={t('contact.form.placeholders.message')}
                      ></textarea>
                    </div>
                    
                    <button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 rounded-lg text-lg font-semibold hover:from-amber-500 hover:to-orange-500 transition-all duration-300 shadow-xl"
                    >
                      {t('contact.form.button')}
                    </button>
                  </form>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 px-6 bg-gradient-to-b from-slate-900 to-slate-950">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    {t('contact.faq.title')}
                  </h2>
                  <p className="text-xl text-white/80 max-w-3xl mx-auto">
                    {t('contact.faq.subtitle')}
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div className="backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:border-amber-500/30">
                    <h3 className="text-xl font-semibold mb-3 text-white">{t('contact.faq.questions.booking.question')}</h3>
                    <p className="text-white/80">{t('contact.faq.questions.booking.answer')}</p>
                  </div>
                  
                  <div className="backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:border-amber-500/30">
                    <h3 className="text-xl font-semibold mb-3 text-white">{t('contact.faq.questions.pricing.question')}</h3>
                    <p className="text-white/80">{t('contact.faq.questions.pricing.answer')}</p>
                  </div>
                  
                  <div className="backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:border-amber-500/30">
                    <h3 className="text-xl font-semibold mb-3 text-white">{t('contact.faq.questions.cancellation.question')}</h3>
                    <p className="text-white/80">{t('contact.faq.questions.cancellation.answer')}</p>
                  </div>
                  
                  <div className="backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:border-amber-500/30">
                    <h3 className="text-xl font-semibold mb-3 text-white">{t('contact.faq.questions.pets.question')}</h3>
                    <p className="text-white/80">{t('contact.faq.questions.pets.answer')}</p>
                  </div>
                </div>
              </div>
            </section>
      <Footer />
    </div>
  );
}
