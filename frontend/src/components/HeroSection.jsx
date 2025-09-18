import React from 'react';

export default function HeroSection({ onNavigate }) {
  return (
    <section className="pt-20 pb-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          Fly Private for
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Less</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Book empty-leg private jet flights at up to 75% off regular charter prices. 
          Luxury travel made accessible.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button 
            onClick={() => onNavigate('signup')}
            className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform"
          >
            Join ChanceFly
          </button>
          <button 
            onClick={() => onNavigate('login')}
            className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl text-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
          >
            Sign In
          </button>
        </div>

        {/* Sample Flight Card Preview */}
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 transform rotate-1 hover:rotate-0 transition-transform">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-lg">Los Angeles → New York</span>
            <span className="text-blue-600 font-bold text-xl">$8,500</span>
          </div>
          <div className="text-sm text-gray-500 mb-2">Today, 2:00 PM</div>
          <div className="text-sm mb-4">Gulfstream G650 • 8 seats available</div>
          <div className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full inline-block">
            Save $25,500 (75% off)
          </div>
        </div>
      </div>
    </section>
  );
}