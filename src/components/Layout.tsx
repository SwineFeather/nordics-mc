
import { useState } from 'react';
import Navigation from './Navigation';
import Footer from './layout/Footer';  
import FloatingChat from './chat/FloatingChat';
import FloatingAIChat from './chat/FloatingAIChat';
import NyrvalosLoadingScreen from './nyrvalos/NyrvalosLoadingScreen';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isChatVisible, setIsChatVisible] = useState(false);

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
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
