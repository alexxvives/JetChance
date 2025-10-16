import React from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  const { t } = useTranslation();

  const scrollToForm = () => {
    const formSection = document.getElementById('inquiry-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const openLoginModal = () => {
    // Trigger login modal by navigating to /login
    window.location.href = '/login';
  };

  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Brand Column */}
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-3 mb-4 justify-center sm:justify-start">
              <img 
                src="/images/logo/logo_white.svg" 
                alt="JetChance" 
                className="h-12 w-auto"
              />
              <span className="text-2xl font-bold text-white">JetChance</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              {t('footer.brand.description')}
            </p>
          </div>

          {/* Services */}
          <div className="text-center sm:text-left">
            <h4 className="text-lg font-semibold mb-4">{t('footer.services.title')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button 
                  onClick={openLoginModal}
                  className="text-amber-500 hover:text-amber-400 transition-colors"
                >
                  {t('footer.services.emptyLeg')}
                </button>
              </li>
              <li>
                <button 
                  onClick={scrollToForm}
                  className="text-amber-500 hover:text-amber-400 transition-colors"
                >
                  {t('footer.services.fullCharter')}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center sm:text-left">
            <h4 className="text-lg font-semibold mb-4">{t('footer.contact.title')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/about" className="hover:text-amber-500 transition-colors">{t('footer.company.aboutUs')}</a></li>
              <li>{t('footer.contact.phone')}</li>
              <li>{t('footer.contact.email')}</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <p className="text-gray-400 text-sm">
            {t('footer.copyright')}
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{t('footer.legal.privacy')}</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{t('footer.legal.terms')}</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{t('footer.legal.safetyStandards')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}