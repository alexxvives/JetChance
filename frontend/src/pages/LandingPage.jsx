import React from 'react';
import HeroSection from '../components/HeroSection';

export default function LandingPage({ onNavigate }) {
  return (
    <>
      <HeroSection onNavigate={onNavigate} />
      
      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">15,000+</div>
              <div className="text-blue-100">Flights Booked</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Verified Operators</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-100">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$50M+</div>
              <div className="text-blue-100">Savings Generated</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Why Choose ChanceFly?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience luxury travel at a fraction of the cost. Our platform connects you with premium empty-leg flights from the world's finest operators.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✈️</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Premium Aircraft</h3>
              <p className="text-gray-600 text-lg">Access to luxury jets from verified operators worldwide. From light jets to heavy jets, find your perfect aircraft.</p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Up to 75% Off</h3>
              <p className="text-gray-600 text-lg">Save significantly on empty-leg flights. What was once exclusive is now accessible to more travelers.</p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Instant Booking</h3>
              <p className="text-gray-600 text-lg">Book and pay securely in minutes. No lengthy approval processes - just simple, fast booking.</p>
            </div>
          </div>

          {/* Additional Features */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0">
                🛡️
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Verified & Insured</h4>
                <p className="text-gray-600">All operators are thoroughly vetted and fully insured for your peace of mind.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0">
                📱
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Mobile Optimized</h4>
                <p className="text-gray-600">Book on-the-go with our mobile-optimized platform. Perfect for last-minute travel.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0">
                🌍
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Global Coverage</h4>
                <p className="text-gray-600">Access flights across major destinations worldwide. From business hubs to vacation spots.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0">
                🎯
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Personalized Service</h4>
                <p className="text-gray-600">Dedicated support team to help with special requests and concierge services.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Booking your dream flight is easier than ever. Follow these simple steps to access luxury travel at unbeatable prices.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center relative">
              <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Search & Compare</h3>
              <p className="text-gray-600 text-lg">Browse available empty-leg flights, compare prices, aircraft types, and departure times to find your perfect match.</p>
            </div>
            <div className="text-center relative">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Book Instantly</h3>
              <p className="text-gray-600 text-lg">Secure your seat with our streamlined booking process. Add passengers, select services, and complete payment in minutes.</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Fly in Luxury</h3>
              <p className="text-gray-600 text-lg">Arrive at the private terminal, skip the crowds, and enjoy your premium travel experience with personalized service.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it. Here's what our satisfied customers have to say.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
              <p className="text-gray-600 mb-6 text-lg">
                "Incredible experience! Saved over $8,000 on our family trip to Aspen. The booking process was seamless and the flight was luxurious."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold">SM</span>
                </div>
                <div>
                  <div className="font-semibold">Sarah Mitchell</div>
                  <div className="text-gray-500">Business Executive</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
              <p className="text-gray-600 mb-6 text-lg">
                "Perfect for last-minute business trips. Found a flight 2 hours before departure at 70% off regular charter prices. Outstanding service!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-semibold">MR</span>
                </div>
                <div>
                  <div className="font-semibold">Michael Rodriguez</div>
                  <div className="text-gray-500">Entrepreneur</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
              <p className="text-gray-600 mb-6 text-lg">
                "ChanceFly made luxury travel accessible for our anniversary trip. Professional, reliable, and the savings were unbelievable."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-semibold">EJ</span>
                </div>
                <div>
                  <div className="font-semibold">Emma Johnson</div>
                  <div className="text-gray-500">Marketing Director</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 px-6">
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
              className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg text-lg hover:bg-gray-100 transition-colors"
            >
              Start Booking Now
            </button>
            <button 
              onClick={() => onNavigate?.('flights')}
              className="border-2 border-white text-white font-semibold px-8 py-4 rounded-lg text-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              Browse Flights
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-50 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-800 mb-4">
            Stay Updated with Exclusive Deals
          </h3>
          <p className="text-gray-600 mb-8 text-lg">
            Subscribe to our newsletter and be the first to know about new empty-leg flights and special offers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">ChanceFly</h3>
              <p className="mb-4">
                Your gateway to luxury travel at accessible prices. Discover empty-leg flights and experience premium aviation.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">📘</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">🐦</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">📷</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">💼</a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Browse Flights</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">For Operators</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">List Your Aircraft</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partner Program</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Operator Portal</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Resources</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety & Security</a></li>
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