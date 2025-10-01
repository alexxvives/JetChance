import React, { useState } from 'react';
import {
  PaperAirplaneIcon,
  ShieldCheckIcon,
  ClockIcon,
  StarIcon,
  MapPinIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const LuxuryLandingPage = () => {
  const [formData, setFormData] = useState({
    serviceType: 'empty-leg',
    name: '',
    email: '',
    phone: '',
    departure: '',
    destination: '',
    date: '',
    passengers: '',
    details: ''
  });
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-slate-300">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          Quote request sent successfully!
        </div>
      )}

      {/* 1. Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/home/hero-jet.jpg" 
            alt="Luxury Private Jet"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-blue-950/85 to-slate-950/95"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/20 backdrop-blur-sm rounded-full border border-amber-500/30">
              <PaperAirplaneIcon className="w-8 h-8 text-amber-500" />
            </div>
          </div>

          {/* Headline */}
          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="text-white">Fly Private,</span>
              <br />
              <span className="text-amber-500">Pay Less</span>
            </h1>
          </div>

          {/* Subheadline */}
          <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Access luxury private jets through empty leg flights at up to 75% off, 
              or book your perfect full charter experience
            </p>
          </div>

          {/* Dual CTAs */}
          <div className="mb-12 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-lg text-lg font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105">
              Book Empty Leg Flight
            </button>
            <button className="px-8 py-4 bg-amber-500 text-black rounded-lg text-lg font-semibold hover:bg-amber-600 transition-all duration-300 hover:scale-105 shadow-lg">
              Request Full Charter
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mb-16 animate-fade-in-up" style={{ animationDelay: '1s' }}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Safety Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>24/7 Concierge</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Instant Booking</span>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full mx-auto">
              <div className="w-1 h-3 bg-white/70 rounded-full mx-auto mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Service Comparison Section */}
      <section className="py-24 bg-gradient-to-b from-blue-200 to-slate-300">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Two Ways to Fly Private
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the option that best fits your schedule and budget
            </p>
          </div>

          {/* Two Card Layout */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Empty Leg Card */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden border-2 border-green-200">
              <div className="p-8 relative">
                {/* Badge - Top Right */}
                <div className="absolute top-4 right-4">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <ArrowTrendingDownIcon className="w-4 h-4" />
                    Save up to 90%
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3 mt-2">
                  <PaperAirplaneIcon className="w-8 h-8 text-amber-500" />
                  Empty Leg Flights
                </h3>
                <p className="text-gray-600 text-sm mb-6">Premium flights at massive discounts when jets return empty</p>

                {/* Perfect for */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Perfect for:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckIcon className="w-5 h-5 text-green-500" />
                      Flexible travel dates
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckIcon className="w-5 h-5 text-green-500" />
                      Budget-conscious travelers
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckIcon className="w-5 h-5 text-green-500" />
                      Last-minute getaways
                    </li>
                  </ul>
                </div>

                {/* Divisor */}
                <div className="border-t border-gray-200 mb-6"></div>

                {/* What you get */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">What you get:</h4>
                  <p className="text-gray-600">
                    Same luxury experience at a fraction of the cost. Access to premium jets 
                    returning empty from previous charters.
                  </p>
                </div>
              </div>
            </div>

            {/* Full Charter Card */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden border-2 border-black">
              <div className="p-8 relative">
                {/* Badge - Top Right */}
                <div className="absolute top-4 right-4">
                  <div className="bg-black text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Premium
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3 mt-2">
                  <CalendarIcon className="w-8 h-8 text-amber-500" />
                  Full Charter
                </h3>
                <p className="text-gray-600 text-sm mb-6">Complete control over your flight experience</p>

                {/* Perfect for */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Perfect for:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckIcon className="w-5 h-5 text-green-500" />
                      Specific destinations
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckIcon className="w-5 h-5 text-green-500" />
                      Custom scheduling
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckIcon className="w-5 h-5 text-green-500" />
                      Group travel
                    </li>
                  </ul>
                </div>

                {/* Divisor */}
                <div className="border-t border-gray-200 mb-6"></div>

                {/* What you get */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">What you get:</h4>
                  <p className="text-gray-600">
                    Complete flexibility and customization. Choose your aircraft, timing, 
                    and destination for the ultimate private jet experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Benefits Section */}
      <section className="py-24 bg-gradient-to-b from-slate-300 to-blue-300">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              The Private Jet Advantage
            </h2>
          </div>

          {/* 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Safety First */}
            <div className="text-center group hover:scale-105 hover:shadow-lg transition-all duration-300 p-6 rounded-xl">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-500 transition-all duration-300">
                  <ShieldCheckIcon className="w-8 h-8 text-amber-600 group-hover:text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Safety First</h3>
              <p className="text-gray-600">
                Rigorous safety standards with certified operators and maintained aircraft
              </p>
            </div>

            {/* Time Efficient */}
            <div className="text-center group hover:scale-105 hover:shadow-lg transition-all duration-300 p-6 rounded-xl">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-500 transition-all duration-300">
                  <ClockIcon className="w-8 h-8 text-amber-600 group-hover:text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Time Efficient</h3>
              <p className="text-gray-600">
                Skip the airport hassles, arrive 15 minutes before departure
              </p>
            </div>

            {/* Premium Comfort */}
            <div className="text-center group hover:scale-105 hover:shadow-lg transition-all duration-300 p-6 rounded-xl">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-500 transition-all duration-300">
                  <StarIcon className="w-8 h-8 text-amber-600 group-hover:text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Premium Comfort</h3>
              <p className="text-gray-600">
                Luxury amenities, spacious cabins, and personalized service
              </p>
            </div>

            {/* Global Access */}
            <div className="text-center group hover:scale-105 hover:shadow-lg transition-all duration-300 p-6 rounded-xl">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-500 transition-all duration-300">
                  <MapPinIcon className="w-8 h-8 text-amber-600 group-hover:text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Global Access</h3>
              <p className="text-gray-600">
                Access to thousands of airports worldwide, reaching destinations airlines can't
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Inquiry Form Section */}
      <section className="py-24 bg-gradient-to-b from-blue-300 to-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Image */}
            <div className="relative h-full">
              <img 
                src="/images/home/jet-interior.jpg" 
                alt="Luxury Jet Interior"
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="text-3xl font-bold mb-2">Your Private Sanctuary</h3>
                <p className="text-lg text-gray-200">Experience luxury at 40,000 feet</p>
              </div>
            </div>

            {/* Right: Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Request Your Quote</h3>
              
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* Service Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Service Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="serviceType"
                        value="empty-leg"
                        checked={formData.serviceType === 'empty-leg'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Empty Leg
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="serviceType"
                        value="full-charter"
                        checked={formData.serviceType === 'full-charter'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Full Charter
                    </label>
                  </div>
                </div>

                {/* Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Flight Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departure
                    </label>
                    <input
                      type="text"
                      name="departure"
                      value={formData.departure}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Destination
                    </label>
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Passengers
                    </label>
                    <input
                      type="number"
                      name="passengers"
                      value={formData.passengers}
                      onChange={handleInputChange}
                      min="1"
                      max="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Details
                  </label>
                  <textarea
                    name="details"
                    value={formData.details}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Special requests, catering preferences, etc."
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-amber-500 text-black py-3 px-6 rounded-lg font-semibold text-lg hover:bg-amber-600 transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                  Request Quote
                </button>

                {/* Privacy Disclaimer */}
                <p className="text-sm text-gray-500 text-center">
                  Your information is secure and will only be used to provide your quote.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="bg-gradient-to-b from-slate-800 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <PaperAirplaneIcon className="w-8 h-8 text-amber-500" />
                <span className="text-xl font-bold">ChanceFly</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Your gateway to luxury private aviation. Experience the world with unmatched 
                comfort, convenience, and style.
              </p>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#inquiry" className="hover:text-amber-500 transition-colors">Empty Leg Flights</a></li>
                <li><a href="#inquiry" className="hover:text-amber-500 transition-colors">Full Charter</a></li>
                <li><a href="#inquiry" className="hover:text-amber-500 transition-colors">Group Travel</a></li>
                <li><a href="#inquiry" className="hover:text-amber-500 transition-colors">Cargo Charter</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>24/7 Available</li>
                <li>+1 (555) 123-4567</li>
                <li>info@chancefly.com</li>
                <li><a href="#inquiry" className="text-amber-500 hover:text-amber-400">Get Quote</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Fleet</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 ChanceFly. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Safety Standards</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LuxuryLandingPage;