
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './layout/Footer';  
import FloatingChat from './chat/FloatingChat';
import FloatingAIChat from './chat/FloatingAIChat';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isChatVisible, setIsChatVisible] = useState(() => {
    // Initialize from localStorage if available, default to false (don't auto-open)
    const saved = localStorage.getItem('chatVisible');
    return saved ? JSON.parse(saved) : false;
  });
  
  const location = useLocation();

  const toggleChat = () => {
    const newState = !isChatVisible;
    setIsChatVisible(newState);
    // Persist to localStorage
    localStorage.setItem('chatVisible', JSON.stringify(newState));
  };

  // Check if we're on the map page
  const isMapPage = location.pathname.startsWith('/map');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      {!isMapPage && <Footer />}
      <FloatingChat 
        isVisible={isChatVisible}
        onToggle={toggleChat}
      />
      <FloatingAIChat />
      
      {/* Nyrvalos Loading Screen Overlay - Temporarily disabled for debugging */}
      {/* {showLoading && (
        <div className="fixed inset-0 z-[9999]">
          <NyrvalosLoadingScreen 
            progress={loadingProgress} 
            message={loadingMessage} 
          />
        </div>
      )} */}
    </div>
  );
};

export default Layout;
