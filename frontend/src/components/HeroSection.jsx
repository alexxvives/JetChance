import React from 'react';
import { useTranslation } from '../contexts/TranslationContext';

export default function HeroSection({ onNavigate }) {
  const { t, currentLanguage } = useTranslation();
  
  // Function to render title with colored specific phrase
  const renderTitle = () => {
    const title = t('hero.title');
    console.log('Title:', title, 'Language:', currentLanguage); // Debug log
    
    if (currentLanguage === 'es') {
      // For Spanish: highlight "volar privado"
      const regex = /volar privado/i;
      if (regex.test(title)) {
        const parts = title.split(regex);
        const match = title.match(regex);
        console.log('Spanish match found:', match[0]); // Debug log
        
        return (
          <>
            {parts[0]}
            <span className="text-violet-400">{match[0]}</span>
            {parts[1]}
          </>
        );
      }
      return title;
    } else {
      // For English: highlight "flying private"  
      const regex = /flying private/i;
      if (regex.test(title)) {
        const parts = title.split(regex);
        const match = title.match(regex);
        console.log('English match found:', match[0]); // Debug log
        
        return (
          <>
            {parts[0]}
            <span className="text-violet-400">{match[0]}</span>
            {parts[1]}
          </>
        );
      }
      return title;
    }
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
