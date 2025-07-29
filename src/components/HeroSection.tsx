
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Zap, Globe, ArrowRight } from 'lucide-react';
import { useServerStatus } from '@/hooks/useServerStatus';
import { useRealTimePlayerData } from '@/hooks/useRealTimePlayerData';
import OnlinePlayersHover from './OnlinePlayersHover';
import WeatherBar from './WeatherBar';
import NordicsLogo from './NordicsLogo';

const HeroSection = () => {
  const { status, loading: serverStatusLoading } = useServerStatus();
  const { data: realTimeData, loading: realTimeLoading, connected } = useRealTimePlayerData();

  // Use real-time data if available, fallback to server status
  const playersOnline = realTimeData?.performance?.players_online ?? status?.players?.online ?? 0;
  const playersList = status?.players?.list || [];

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-glow" style={{
          animationDelay: '1s'
        }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" style={{
          animationDelay: '2s'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <NordicsLogo size="lg" className="animate-fade-in" />
          </div>

          {/* Weather and Status badges */}
          <div className="flex justify-center items-center space-x-4 mb-6">
            {/* Server Status Badge */}
            <OnlinePlayersHover 
              players={playersList} 
              loading={serverStatusLoading} 
              realTimeData={realTimeData?.players}
            >
              <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-2 rounded-2xl animate-fade-in cursor-pointer transition-all hover:bg-primary/30">
                {serverStatusLoading ? (
                  <>
                    <span className="w-2 h-2 rounded-full mr-2 bg-yellow-500 animate-pulse"></span>
                    Checking server...
                  </>
                ) : status ? (
                  <>
                    <span className={`w-2 h-2 rounded-full mr-2 ${status.online ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    {status.online ? `Server Online • ${playersOnline} Players` : 'Server Offline'}
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full mr-2 bg-gray-500"></span>
                    Status unavailable
                  </>
                )}
              </Badge>
            </OnlinePlayersHover>

            {/* Weather Bar */}
            {realTimeData?.weather && (
              <WeatherBar weather={realTimeData.weather} connected={connected} />
            )}
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium mb-6 animate-fade-in">
            Welcome to{' '}
            <span className="gradient-text text-black">Nordics Minecraft</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-fade-in" style={{
            animationDelay: '0.2s'
          }}>
            Experience the ultimate Minecraft adventure with custom content, 
            amazing community, and endless possibilities in our Nordic-themed world.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in" style={{
            animationDelay: '0.4s'
          }}>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-2xl text-lg font-medium hover-lift glow-primary group" onClick={() => navigator.clipboard.writeText('nordics.world')}>
              Join nordics.world
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="border-2 border-border/50 px-8 py-4 rounded-2xl text-lg font-medium hover:bg-muted hover-lift" onClick={() => window.open('https://map.nordics.world', '_blank')}>
              View Live Map
            </Button>
          </div>

          {/* Server stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fade-in" style={{
            animationDelay: '0.6s'
          }}>
            <div className="glass-card p-6 rounded-3xl hover-lift group">
              <OnlinePlayersHover 
                players={playersList} 
                loading={serverStatusLoading}
                realTimeData={realTimeData?.players}
              >
                <div className="cursor-pointer">
                  <Users className="w-8 h-8 text-primary mb-4 mx-auto group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-bold gradient-text">
                    {serverStatusLoading ? '...' : playersOnline + '+'}
                  </div>
                  <div className="text-muted-foreground">Active Players</div>
                </div>
              </OnlinePlayersHover>
            </div>
            
            <div className="glass-card p-6 rounded-3xl hover-lift group">
              <Zap className="w-8 h-8 text-secondary mb-4 mx-auto group-hover:scale-110 transition-transform" />
              <div className="text-3xl font-bold gradient-text">
                {realTimeData?.performance?.tps ? `${realTimeData.performance.tps.toFixed(1)}` : '20.0'}
              </div>
              <div className="text-muted-foreground">Server TPS</div>
            </div>
            
            <div className="glass-card p-6 rounded-3xl hover-lift group">
              <Globe className="w-8 h-8 text-accent mb-4 mx-auto group-hover:scale-110 transition-transform" />
              <div className="text-3xl font-bold gradient-text">24/7</div>
              <div className="text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
