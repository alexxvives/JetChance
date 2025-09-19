import React from 'react';
import { useTranslation } from '../contexts/TranslationContext';

export default function HeroSection({ onNavigate }) {
  const { t } = useTranslation();
  
  // Function to render title with colored last word
  const renderTitle = () => {
    const title = t('hero.title');
    const words = title.split(' ');
    const lastWord = words.pop();
    const firstWords = words.join(' ');
    
    return (
      <span>
        {firstWords} <span className="text-violet-400">{lastWord}</span>
      </span>
    );
  };
  
  return (
    <section className="pt-32 pb-40 px-6 min-h-screen flex items-center">
      <div className="max-w-4xl mx-auto text-center w-full">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight drop-shadow-2xl">
          {renderTitle()}
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 mb-16 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
          {t('hero.subtitle')}
        </p>

        <div className="flex justify-center items-center">
          <button 
            onClick={() => onNavigate('flights')}
            className="px-8 py-4 bg-violet-500/90 backdrop-blur-sm text-white font-semibold rounded-xl text-lg hover:bg-violet-600 transition-colors shadow-2xl hover:shadow-3xl transform hover:-translate-y-0.5 transition-all border border-violet-400/30"
          >
            {t('hero.browseFlights')}
          </button>
        </div>

        {/* Simple CTA focused hero */}
      </div>
    </section>
  );
}