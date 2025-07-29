import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useNyrvalosNavigation = () => {
  const [showLoading, setShowLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Initializing world map...");
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we're navigating to Nyrvalos
  useEffect(() => {
    if (location.pathname === '/nyrvalos' && !showLoading) {
      console.log('Navigating to Nyrvalos, showing loading screen');
      setShowLoading(true);
      setLoadingProgress(0);
      setLoadingMessage("Initializing world map...");
    }
  }, [location.pathname, showLoading]);

  // Simulate loading progress when showing loading screen
  useEffect(() => {
    if (showLoading) {
      const loadingSteps = [
        { progress: 15, message: "Initializing world map..." },
        { progress: 30, message: "Loading territories..." },
        { progress: 50, message: "Preparing diplomatic relations..." },
        { progress: 70, message: "Setting up military forces..." },
        { progress: 85, message: "Establishing trade routes..." },
        { progress: 95, message: "Finalizing political landscape..." }
      ];

      let currentStep = 0;
      const progressInterval = setInterval(() => {
        if (currentStep < loadingSteps.length) {
          setLoadingProgress(loadingSteps[currentStep].progress);
          setLoadingMessage(loadingSteps[currentStep].message);
          currentStep++;
        } else {
          clearInterval(progressInterval);
          // Hide loading screen after a short delay
          setTimeout(() => {
            console.log('Hiding Nyrvalos loading screen');
            setShowLoading(false);
            setLoadingProgress(0);
          }, 1000);
        }
      }, 800);

      return () => clearInterval(progressInterval);
    }
  }, [showLoading]);

  const navigateToNyrvalos = () => {
    setShowLoading(true);
    setLoadingProgress(0);
    setLoadingMessage("Initializing world map...");
    navigate('/nyrvalos');
  };

  return {
    showLoading,
    loadingProgress,
    loadingMessage,
    navigateToNyrvalos
  };
}; 