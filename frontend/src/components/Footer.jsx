import React from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PaperAirplaneIcon className="w-8 h-8 text-amber-500" />
              <span className="text-xl font-bold">JetChance</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              {t('footer.brand.description')}
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.services.title')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#inquiry" className="hover:text-amber-500 transition-colors">{t('footer.services.emptyLeg')}</a></li>
              <li><a href="#inquiry" className="hover:text-amber-500 transition-colors">{t('footer.services.fullCharter')}</a></li>
              <li><a href="#inquiry" className="hover:text-amber-500 transition-colors">{t('footer.services.groupTravel')}</a></li>
              <li><a href="#inquiry" className="hover:text-amber-500 transition-colors">{t('footer.services.cargoCharter')}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.contact.title')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li>{t('footer.contact.available')}</li>
              <li>{t('footer.contact.phone')}</li>
              <li>{t('footer.contact.email')}</li>
              <li><a href="#inquiry" className="text-amber-500 hover:text-amber-400">{t('footer.contact.getQuote')}</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.company.title')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.company.aboutUs')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.company.safety')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.company.fleet')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.company.careers')}</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
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