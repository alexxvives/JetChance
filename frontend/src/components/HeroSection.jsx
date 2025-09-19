import React from 'react';

export default function HeroSection({ onNavigate }) {
  return (
    <section className="pt-32 pb-40 px-6 min-h-screen flex items-center">
      <div className="max-w-4xl mx-auto text-center w-full">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight drop-shadow-2xl">
          Fly Private for
          <span className="bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent"> Less</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 mb-16 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
          Book empty-leg private jet flights at up to 95% off regular charter prices. 
          Luxury travel made accessible.
        </p>

        <div className="flex justify-center items-center">
          <button 
            onClick={() => onNavigate('signup')}
            className="px-12 py-5 bg-violet-500/90 backdrop-blur-sm text-white font-semibold rounded-xl text-xl hover:bg-violet-600 transition-colors shadow-2xl hover:shadow-3xl transform hover:-translate-y-0.5 transition-all border border-violet-400/30"
          >
            Join ChanceFly
          </button>
        </div>

        {/* Simple CTA focused hero */}
      </div>
    </section>
  );
}