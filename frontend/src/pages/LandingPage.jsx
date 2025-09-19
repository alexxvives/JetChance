import React from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import HeroSection from '../components/HeroSection';
import FlightCards from '../components/FlightCards';

export default function LandingPage({ onNavigate }) {
  const { t } = useTranslation();
  
  return (
    <>
      <HeroSection onNavigate={onNavigate} />
      
      {/* Flight Cards Section */}
      <FlightCards />
      
      {/* How It Works Section */}
      <section className="py-20 bg-black/40 backdrop-blur-sm px-6 border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('howItWorks.title')}
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center relative">
              <div className="w-24 h-24 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-400/30">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">{t('howItWorks.step1.title')}</h3>
              <p className="text-white/70 text-lg">{t('howItWorks.step1.description')}</p>
            </div>
            <div className="text-center relative">
              <div className="w-24 h-24 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-400/30">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">{t('howItWorks.step2.title')}</h3>
              <p className="text-white/70 text-lg">{t('howItWorks.step2.description')}</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-400/30">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">{t('howItWorks.step3.title')}</h3>
              <p className="text-white/70 text-lg">{t('howItWorks.step3.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('whyChoose.title')}
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              {t('whyChoose.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-white/20">
              <div className="w-20 h-20 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-400/30">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">{t('whyChoose.savings.title')}</h3>
              <p className="text-white/70 text-lg">{t('whyChoose.savings.description')}</p>
            </div>
            <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-white/20">
              <div className="w-20 h-20 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-400/30">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">{t('whyChoose.quality.title')}</h3>
              <p className="text-white/70 text-lg">{t('whyChoose.quality.description')}</p>
            </div>
            <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-white/20">
              <div className="w-20 h-20 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-400/30">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">{t('whyChoose.instant.title')}</h3>
              <p className="text-white/70 text-lg">{t('whyChoose.instant.description')}</p>
            </div>
          </div>

          {/* Additional Features */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-colors">
              <div className="w-12 h-12 bg-violet-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0 border border-violet-400/30">
                �
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2 text-white">{t('advantages.noQueues')}</h4>
                <p className="text-white/70">{t('advantages.noQueuesSub')}</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-colors">
              <div className="w-12 h-12 bg-violet-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0 border border-violet-400/30">
                �
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2 text-white">{t('advantages.flexibility')}</h4>
                <p className="text-white/70">{t('advantages.flexibilitySub')}</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-colors">
              <div className="w-12 h-12 bg-violet-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0 border border-violet-400/30">
                🔒
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2 text-white">{t('advantages.privacy')}</h4>
                <p className="text-white/70">{t('advantages.privacySub')}</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-colors">
              <div className="w-12 h-12 bg-violet-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0 border border-violet-400/30">
                ✨
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2 text-white">{t('advantages.luxury')}</h4>
                <p className="text-white/70">{t('advantages.luxurySub')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/5 backdrop-blur-sm border-y border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">15,000+</div>
              <div className="text-white/70">{t('stats.flightsBooked')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-white/70">{t('stats.verifiedOperators')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-white/70">{t('stats.customerSatisfaction')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$50M+</div>
              <div className="text-white/70">{t('stats.savingsGenerated')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('testimonials.title')}
            </h2>
            <p className="text-xl text-white/80">
              {t('testimonials.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 hover:bg-white/20 transition-colors">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
              <p className="text-white/80 mb-6 text-lg">
                "{t('testimonials.customer1.text')}"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-4 border border-violet-400/30">
                  <span className="text-violet-300 font-semibold">SC</span>
                </div>
                <div>
                  <div className="font-semibold text-white">{t('testimonials.customer1.name')}</div>
                  <div className="text-white/60">{t('testimonials.customer1.title')}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 hover:bg-white/20 transition-colors">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
              <p className="text-white/80 mb-6 text-lg">
                "{t('testimonials.customer2.text')}"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-4 border border-violet-400/30">
                  <span className="text-violet-300 font-semibold">MR</span>
                </div>
                <div>
                  <div className="font-semibold text-white">{t('testimonials.customer2.name')}</div>
                  <div className="text-white/60">{t('testimonials.customer2.title')}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 hover:bg-white/20 transition-colors">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
              <p className="text-white/80 mb-6 text-lg">
                "{t('testimonials.customer3.text')}"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-4 border border-violet-400/30">
                  <span className="text-violet-300 font-semibold">EP</span>
                </div>
                <div>
                  <div className="font-semibold text-white">{t('testimonials.customer3.name')}</div>
                  <div className="text-white/60">{t('testimonials.customer3.title')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white/5 backdrop-blur-sm px-6 border-y border-white/10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl mb-8 text-white/80">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => onNavigate?.('signup')}
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg"
            >
              {t('cta.startBooking')}
            </button>
            <button 
              onClick={() => onNavigate?.('flights')}
              className="border-2 border-white/40 bg-white/10 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-lg text-lg hover:bg-white/20 transition-colors"
            >
              {t('cta.browseFlights')}
            </button>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900/90 backdrop-blur-sm text-gray-300 py-16 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          {/* Newsletter Section */}
          <div className="text-center mb-12 pb-8 border-b border-gray-700">
            <h3 className="text-3xl font-bold text-white mb-4">
              {t('footer.newsletter.title')}
            </h3>
            <p className="text-white/80 mb-8 text-lg">
              {t('footer.newsletter.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder={t('footer.newsletter.placeholder')}
                className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-white placeholder-white/60"
              />
              <button className="bg-violet-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors">
                {t('footer.newsletter.subscribe')}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">ChanceFly</h3>
              <p className="mb-4 text-white/70">
                {t('footer.company.description')}
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">📘</a>
                <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">🐦</a>
                <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">📷</a>
                <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">💼</a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">{t('footer.quickLinks.title')}</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-violet-300 transition-colors">{t('footer.quickLinks.browseFlights')}</a></li>
                <li><a href="#" className="hover:text-violet-300 transition-colors">{t('footer.quickLinks.howItWorks')}</a></li>
                <li><a href="#" className="hover:text-violet-300 transition-colors">{t('footer.quickLinks.pricing')}</a></li>
                <li><a href="#" className="hover:text-violet-300 transition-colors">{t('footer.quickLinks.about')}</a></li>
                <li><a href="#" className="hover:text-violet-300 transition-colors">{t('footer.quickLinks.contact')}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">{t('footer.operators.title')}</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-violet-300 transition-colors">{t('footer.operators.listAircraft')}</a></li>
                <li><a href="#" className="hover:text-violet-300 transition-colors">{t('footer.operators.partnerProgram')}</a></li>
                <li><a href="#" className="hover:text-violet-300 transition-colors">{t('footer.operators.operatorPortal')}</a></li>
                <li><a href="#" className="hover:text-violet-300 transition-colors">{t('footer.operators.resources')}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">{t('footer.support.title')}</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-violet-300 transition-colors">{t('footer.support.helpCenter')}</a></li>
                <li><a href="#" className="hover:text-violet-300 transition-colors">{t('footer.support.privacy')}</a></li>
                <li><a href="#" className="hover:text-violet-300 transition-colors">{t('footer.support.terms')}</a></li>
                <li><a href="#" className="hover:text-violet-300 transition-colors">{t('footer.support.safety')}</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">{t('footer.copyright')}</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-sm">📞 1-800-CHANCE-FLY</span>
              <span className="text-sm">✉️ hello@chancefly.com</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}