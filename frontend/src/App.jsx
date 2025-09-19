import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const [useSimpleBackground, setUseSimpleBackground] = useState(false);
  const [currentFPS, setCurrentFPS] = useState(null);

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
    <AuthProvider>
      <Router>
        {/* Adaptive Background */}
        <div className="fixed inset-0 z-0">
          <PlasmaBackground 
            color="#B19EEF"
            speed={1}
            direction="Forward"
            scale={0.9}
            opacity={10}
            mouseInteractive={false}
          />
        </div>
        
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
            </Routes>
          </div>
        </div>
        
        {/* Performance Indicator */}
        <PerformanceIndicator 
          useSimpleBackground={useSimpleBackground} 
          fps={currentFPS} 
        />
      </Router>
    </AuthProvider>
  );
}