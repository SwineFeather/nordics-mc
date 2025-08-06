
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './layout/Footer';  
import FloatingChat from './chat/FloatingChat';
import FloatingAIChat from './chat/FloatingAIChat';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isChatVisible, setIsChatVisible] = useState(false);
  const location = useLocation();

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
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
