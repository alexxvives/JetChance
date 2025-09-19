import React from 'react';
import HeroSection from '../components/HeroSection';
import FlightCards from '../components/FlightCards';

export default function LandingPage({ onNavigate }) {
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
              How It Works
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Booking your dream flight is easier than ever. Follow these simple steps to access luxury travel at unbeatable prices.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center relative">
              <div className="w-24 h-24 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-400/30">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Search & Compare</h3>
              <p className="text-white/70 text-lg">Browse available empty-leg flights, compare prices, aircraft types, and departure times to find your perfect match.</p>
            </div>
            <div className="text-center relative">
              <div className="w-24 h-24 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-400/30">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Book Instantly</h3>
              <p className="text-white/70 text-lg">Secure your seat with our streamlined booking process. Add passengers, select services, and complete payment in minutes.</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-400/30">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Fly in Luxury</h3>
              <p className="text-white/70 text-lg">Arrive at the private terminal, skip the crowds, and enjoy your premium travel experience with personalized service.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose ChanceFly?
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Experience luxury travel at a fraction of the cost. Our platform connects you with premium empty-leg flights from the world's finest operators.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-white/20">
              <div className="w-20 h-20 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-400/30">
                <span className="text-3xl">✈️</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Premium Aircraft</h3>
              <p className="text-white/70 text-lg">Access to luxury jets from verified operators worldwide. From light jets to heavy jets, find your perfect aircraft.</p>
            </div>
            <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-white/20">
              <div className="w-20 h-20 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-400/30">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Up to 75% Off</h3>
              <p className="text-white/70 text-lg">Save significantly on empty-leg flights. What was once exclusive is now accessible to more travelers.</p>
            </div>
            <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-white/20 hover:bg-white/20">
              <div className="w-20 h-20 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-400/30">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Instant Booking</h3>
              <p className="text-white/70 text-lg">Book and pay securely in minutes. No lengthy approval processes - just simple, fast booking.</p>
            </div>
          </div>

          {/* Additional Features */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-colors">
              <div className="w-12 h-12 bg-violet-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0 border border-violet-400/30">
                🛡️
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2 text-white">Verified & Insured</h4>
                <p className="text-white/70">All operators are thoroughly vetted and fully insured for your peace of mind.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-colors">
              <div className="w-12 h-12 bg-violet-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0 border border-violet-400/30">
                📱
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2 text-white">Mobile Optimized</h4>
                <p className="text-white/70">Book on-the-go with our mobile-optimized platform. Perfect for last-minute travel.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-colors">
              <div className="w-12 h-12 bg-violet-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0 border border-violet-400/30">
                🌍
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2 text-white">Global Coverage</h4>
                <p className="text-white/70">Access flights across major destinations worldwide. From business hubs to vacation spots.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-colors">
              <div className="w-12 h-12 bg-violet-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0 border border-violet-400/30">
                🎯
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2 text-white">Personalized Service</h4>
                <p className="text-white/70">Dedicated support team to help with special requests and concierge services.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-violet-600 to-black">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">15,000+</div>
              <div className="text-violet-100">Flights Booked</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-violet-100">Verified Operators</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-violet-100">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$50M+</div>
              <div className="text-violet-100">Savings Generated</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              What Our Customers Say
            </h2>
            <p className="text-xl text-white/80">
              Don't just take our word for it. Here's what our satisfied customers have to say.
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
                "Incredible experience! Saved over $8,000 on our family trip to Aspen. The booking process was seamless and the flight was luxurious."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-4 border border-violet-400/30">
                  <span className="text-violet-300 font-semibold">SM</span>
                </div>
                <div>
                  <div className="font-semibold text-white">Sarah Mitchell</div>
                  <div className="text-white/60">Business Executive</div>
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
                "Perfect for last-minute business trips. Found a flight 2 hours before departure at 70% off regular charter prices. Outstanding service!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-4 border border-violet-400/30">
                  <span className="text-violet-300 font-semibold">MR</span>
                </div>
                <div>
                  <div className="font-semibold text-white">Michael Rodriguez</div>
                  <div className="text-white/60">Entrepreneur</div>
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
                "ChanceFly made luxury travel accessible for our anniversary trip. Professional, reliable, and the savings were unbelievable."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-violet-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-4 border border-violet-400/30">
                  <span className="text-violet-300 font-semibold">EJ</span>
                </div>
                <div>
                  <div className="font-semibold text-white">Emma Johnson</div>
                  <div className="text-white/60">Marketing Director</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-violet-600 to-black px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Experience Luxury Travel?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of smart travelers who've discovered the ChanceFly advantage. 
            Your next luxury flight is just a click away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => onNavigate?.('signup')}
              className="bg-white/90 backdrop-blur-sm text-violet-600 font-semibold px-8 py-4 rounded-lg text-lg hover:bg-white transition-colors border border-white/30"
            >
              Start Booking Now
            </button>
            <button 
              onClick={() => onNavigate?.('flights')}
              className="border-2 border-white/40 bg-white/10 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-lg text-lg hover:bg-white/20 transition-colors"
            >
              Browse Flights
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
              Stay Updated with Exclusive Deals
            </h3>
            <p className="text-white/80 mb-8 text-lg">
              Subscribe to our newsletter and be the first to know about new empty-leg flights and special offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-white placeholder-white/60"
              />
              <button className="bg-violet-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">ChanceFly</h3>
              <p className="mb-4 text-white/70">
                Your gateway to luxury travel at accessible prices. Discover empty-leg flights and experience premium aviation.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">📘</a>
                <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">🐦</a>
                <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">📷</a>
                <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">💼</a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-violet-300 transition-colors">Browse Flights</a></li>
                <li><a href="#" className="hover:text-violet-300 transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-violet-300 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-violet-300 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-violet-300 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">For Operators</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-violet-300 transition-colors">List Your Aircraft</a></li>
                <li><a href="#" className="hover:text-violet-300 transition-colors">Partner Program</a></li>
                <li><a href="#" className="hover:text-violet-300 transition-colors">Operator Portal</a></li>
                <li><a href="#" className="hover:text-violet-300 transition-colors">Resources</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-violet-300 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-violet-300 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-violet-300 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-violet-300 transition-colors">Safety & Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2025 ChanceFly. All rights reserved.</p>
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