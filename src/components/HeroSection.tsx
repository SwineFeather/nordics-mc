
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, ArrowRight, Flag } from 'lucide-react';
import { useServerStatus } from '@/hooks/useServerStatus';
import OnlinePlayersHover from './OnlinePlayersHover';
import NordicsLogo from './NordicsLogo';
import ServerIPModal from './ServerIPModal';
import { useState } from 'react';

const HeroSection = () => {
  const { status, loading: serverStatusLoading } = useServerStatus();
  const [showServerModal, setShowServerModal] = useState(false);

  // Use server status data only
  const playersOnline = status?.players?.online ?? 0;
  const playersList = status?.players?.list || [];

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Animated background elements with Nordic colors */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse-glow" style={{
          animationDelay: '1s'
        }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl animate-pulse-glow" style={{
          animationDelay: '2s'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <NordicsLogo size="lg" className="animate-fade-in" />
          </div>

          {/* Server Status Badge */}
          <div className="flex justify-center items-center mb-6">
            {status?.online && (
              <OnlinePlayersHover 
                players={playersList} 
                loading={serverStatusLoading}
              >
                <Badge className="bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700 px-4 py-2 rounded-2xl animate-fade-in cursor-pointer transition-all hover:bg-orange-200 dark:hover:bg-orange-900/30">
                  <span className="w-2 h-2 rounded-full mr-2 bg-green-500 animate-pulse"></span>
                  Server Online • {playersOnline} Players
                </Badge>
              </OnlinePlayersHover>
            )}
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium mb-6 animate-fade-in">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Nordics Minecraft</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-fade-in" style={{
            animationDelay: '0.2s'
          }}>
            Experience the ultimate Minecraft adventure with custom content, 
            amazing community, and endless possibilities in our Nordic-themed world.
          </p>

          {/* Nordic flag colors accent */}
          <div className="flex justify-center space-x-2 mb-8 animate-fade-in" style={{
            animationDelay: '0.3s'
          }}>
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <div className="w-3 h-3 bg-white border border-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in" style={{
            animationDelay: '0.4s'
          }}>
            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-2xl text-lg font-medium hover-lift glow-primary group" onClick={() => setShowServerModal(true)}>
              Join nordics.world
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="border-2 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 px-8 py-4 rounded-2xl text-lg font-medium hover-lift" onClick={() => window.open('https://map.nordics.world', '_blank')}>
              View Live Map
            </Button>
          </div>

          {/* Server stats */}
          <div className="flex justify-center max-w-4xl mx-auto animate-fade-in" style={{
            animationDelay: '0.6s'
          }}>
            <div className="glass-card p-6 rounded-3xl hover-lift group border border-orange-200 dark:border-orange-800">
              <OnlinePlayersHover 
                players={playersList} 
                loading={serverStatusLoading}
              >
                <div className="cursor-pointer">
                  <Users className="w-8 h-8 text-orange-500 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    {serverStatusLoading ? '...' : playersOnline + '+'}
                  </div>
                  <div className="text-muted-foreground">Active Players</div>
                </div>
              </OnlinePlayersHover>
            </div>
          </div>
        </div>
      </div>
      
      {/* Server IP Modal */}
      <ServerIPModal 
        isOpen={showServerModal} 
        onClose={() => setShowServerModal(false)} 
      />
    </section>
  );
};

export default HeroSection;
