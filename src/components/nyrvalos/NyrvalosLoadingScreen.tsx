import React from 'react';
import { Globe, Crown, Sword, Shield, Map, Castle, Mountain, Trees, Compass, Star } from 'lucide-react';

interface NyrvalosLoadingScreenProps {
  progress?: number;
  message?: string;
}

const NyrvalosLoadingScreen: React.FC<NyrvalosLoadingScreenProps> = ({ 
  progress = 0, 
  message = "Preparing the political landscape..." 
}) => {
  const loadingSteps = [
    "Initializing world map...",
    "Loading territories...",
    "Preparing diplomatic relations...",
    "Setting up military forces...",
    "Establishing trade routes...",
    "Finalizing political landscape..."
  ];

  const currentStep = Math.floor((progress / 100) * loadingSteps.length);
  const currentMessage = loadingSteps[Math.min(currentStep, loadingSteps.length - 1)] || message;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Floating islands */}
        <div className="absolute top-20 left-10 animate-float-slow">
          <Mountain className="w-16 h-16 text-gray-400/30" />
        </div>
        <div className="absolute top-40 right-20 animate-float-medium">
          <Castle className="w-12 h-12 text-gray-300/40" />
        </div>
        <div className="absolute bottom-32 left-1/4 animate-float-fast">
          <Trees className="w-14 h-14 text-green-400/30" />
        </div>
        <div className="absolute bottom-20 right-1/3 animate-float-slow">
          <Compass className="w-10 h-10 text-blue-300/40" />
        </div>
        
        {/* Stars */}
        <div className="absolute top-16 left-1/3 animate-pulse">
          <Star className="w-4 h-4 text-yellow-300/60" />
        </div>
        <div className="absolute top-32 right-1/4 animate-pulse delay-300">
          <Star className="w-3 h-3 text-yellow-200/50" />
        </div>
        <div className="absolute bottom-40 left-1/2 animate-pulse delay-700">
          <Star className="w-2 h-2 text-yellow-400/40" />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-2xl mx-auto px-6">
          {/* Logo and title */}
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Globe className="w-20 h-20 text-white animate-spin-slow" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-yellow-400 animate-pulse" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-wider">
              NYRVALOS
            </h1>
            <p className="text-xl text-gray-300 font-medium">
              Political Strategy Game
            </p>
          </div>

          {/* Loading animation */}
          <div className="mb-8">
            <div className="flex justify-center items-center space-x-4 mb-6">
              <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-200"></div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full max-w-md mx-auto mb-4">
              <div className="bg-black/30 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            
            {/* Progress percentage */}
            <div className="text-white font-mono text-sm mb-4">
              {Math.round(progress)}%
            </div>
          </div>

          {/* Loading message */}
          <div className="mb-8">
            <p className="text-lg text-gray-300 font-medium animate-pulse">
              {currentMessage}
            </p>
          </div>

          {/* Game stats preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg mx-auto">
            <div className="flex flex-col items-center p-3 bg-black/20 rounded-lg border border-white/10">
              <Sword className="w-6 h-6 text-red-400 mb-2" />
              <span className="text-white text-sm font-medium">Military</span>
              <span className="text-gray-300 text-xs">Preparing...</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-black/20 rounded-lg border border-white/10">
              <Shield className="w-6 h-6 text-blue-400 mb-2" />
              <span className="text-white text-sm font-medium">Defense</span>
              <span className="text-gray-300 text-xs">Loading...</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-black/20 rounded-lg border border-white/10">
              <Crown className="w-6 h-6 text-yellow-400 mb-2" />
              <span className="text-white text-sm font-medium">Influence</span>
              <span className="text-gray-300 text-xs">Calculating...</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-black/20 rounded-lg border border-white/10">
              <Map className="w-6 h-6 text-green-400 mb-2" />
              <span className="text-white text-sm font-medium">Territories</span>
              <span className="text-gray-300 text-xs">Mapping...</span>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm italic">
              "In the realm of Nyrvalos, every decision shapes the destiny of nations."
            </p>
          </div>
        </div>
      </div>

      {/* Animated border effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse delay-500"></div>
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-indigo-500 to-transparent animate-pulse delay-300"></div>
        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent animate-pulse delay-700"></div>
      </div>
    </div>
  );
};

export default NyrvalosLoadingScreen; 