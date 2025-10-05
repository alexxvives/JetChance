import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TranslationProvider } from './contexts/TranslationContext';
import Navbar from './components/Navbar';
import SimpleGradientBackground from './components/SimpleGradientBackground';
import PerformanceIndicator from './components/PerformanceIndicator';
import LuxuryLandingPage from './pages/LuxuryLandingPageNew';
import Dashboard from './pages/Dashboard';
import FlightDetailsPage from './pages/FlightDetailsPage';
import PaymentPage from './pages/PaymentPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import CreateFlightPage from './pages/CreateFlightPage';
import EditFlightPage from './pages/EditFlightPage';
import PendingFlightsPage from './pages/PendingFlightsPage';
import OperatorsPage from './pages/OperatorsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import OperatorOnlyRoute from './components/OperatorOnlyRoute';

function AppContent() {
  const [useSimpleBackground, setUseSimpleBackground] = useState(false);
  const [currentFPS, setCurrentFPS] = useState(null);
  const location = useLocation();

  // Check if we're on the home page
  const isHomePage = location.pathname === '/';

  // Performance detection
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const checkPerformance = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 2000) { // Check every 2 seconds
        const fps = frameCount / 2;
        setCurrentFPS(fps);
        
        if (fps < 30 && !useSimpleBackground) {
          console.log(`Low FPS detected (${fps.toFixed(1)}), switching to simple background`);
          setUseSimpleBackground(true);
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(checkPerformance);
    };
    
    const rafId = requestAnimationFrame(checkPerformance);
    
    return () => cancelAnimationFrame(rafId);
  }, [useSimpleBackground]);

  return (
    <>
      <div className="min-h-screen">
          {/* Content */}
          <div className="relative z-10">
            {/* Show Navbar only on landing page routes */}
            {(location.pathname === '/' || location.pathname === '/luxury' || location.pathname === '/login' || location.pathname === '/signup') && (
              <Navbar 
                useSimpleBackground={useSimpleBackground}
                setUseSimpleBackground={setUseSimpleBackground}
                isHomePage={isHomePage}
              />
            )}
            <Routes>
              <Route path="/" element={<LuxuryLandingPage />} />
              <Route path="/luxury" element={<LuxuryLandingPage />} />
              <Route path="/login" element={<LuxuryLandingPage />} />
              <Route path="/signup" element={<LuxuryLandingPage />} />
              <Route path="/flight/:id" element={<FlightDetailsPage />} />
              <Route path="/payment/:flightId" element={<PaymentPage />} />
              <Route path="/booking-success" element={<BookingSuccessPage />} />
              <Route path="/operators" element={<OperatorsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-flight" 
                element={
                  <ProtectedRoute>
                    <OperatorOnlyRoute>
                      <CreateFlightPage />
                    </OperatorOnlyRoute>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/edit-flight/:id" 
                element={
                  <ProtectedRoute>
                    <OperatorOnlyRoute>
                      <CreateFlightPage />
                    </OperatorOnlyRoute>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/pending-flights" 
                element={
                  <ProtectedRoute>
                    <PendingFlightsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </div>
        
        {/* Performance Indicator */}
        <PerformanceIndicator 
          useSimpleBackground={useSimpleBackground} 
          fps={currentFPS} 
        />
    </>
  );
}

export default function App() {
  return (
    <TranslationProvider>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <AppContent />
        </Router>
      </AuthProvider>
    </TranslationProvider>
  );
}
