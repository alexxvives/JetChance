import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TranslationProvider } from './contexts/TranslationContext';
import Navbar from './components/Navbar';
import PlasmaBackground from './components/PlasmaBackground';
import SimpleGradientBackground from './components/SimpleGradientBackground';
import PerformanceIndicator from './components/PerformanceIndicator';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import FlightDetailsPage from './pages/FlightDetailsPage';
import CreateFlightPage from './pages/CreateFlightPage';
import PendingFlightsPage from './pages/PendingFlightsPage';
import OperatorsPage from './pages/OperatorsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const [useSimpleBackground, setUseSimpleBackground] = useState(false);
  const [currentFPS, setCurrentFPS] = useState(null);
  const location = useLocation();

  // Only show PlasmaBackground on home page
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
      {/* Adaptive Background - Only on home page */}
      {isHomePage && (
        <div className="fixed inset-0 z-0">
          <PlasmaBackground 
            color="#B19EEF"
            speed={1}
            direction="Forward"
            scale={0.9}
            opacity={1}
            mouseInteractive={false}
          />
        </div>
      )}

      <div className="min-h-screen bg-black">
          {/* Content */}
          <div className="relative z-10">
            <Navbar 
              useSimpleBackground={useSimpleBackground}
              setUseSimpleBackground={setUseSimpleBackground}
            />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/flight/:id" element={<FlightDetailsPage />} />
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
                    <CreateFlightPage />
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
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </TranslationProvider>
  );
}