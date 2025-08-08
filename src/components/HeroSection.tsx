
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, ArrowRight, Flag } from 'lucide-react';
import { useServerStatus } from '@/hooks/useServerStatus';
import { useTownLocations } from '@/hooks/useTownLocations';
import OnlinePlayersHover from './OnlinePlayersHover';
import NordicsLogo from './NordicsLogo';
import ServerIPModal from './ServerIPModal';
import { useEffect, useRef, useState } from 'react';

const HeroSection = () => {
  const { status, loading: serverStatusLoading } = useServerStatus();
  const { towns, loading: townsLoading } = useTownLocations();
  const [showServerModal, setShowServerModal] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const VIEWBOX_WIDTH = 15360;
  const VIEWBOX_HEIGHT = 8832;
  const initialScale = typeof window !== 'undefined' && window.innerWidth
    ? Math.max(0.05, window.innerWidth / VIEWBOX_WIDTH)
    : 0.1;
  const [svgScale, setSvgScale] = useState(initialScale); // screenPixelsPerSvgUnit = widthPx / VIEWBOX_WIDTH


  // Use server status data only
  const playersOnline = status?.players?.online ?? 0;
  const playersList = status?.players?.list || [];

  // Coordinate conversion function aligned with world extents
  const convertToMapCoordinates = (x: number, z: number) => {
    // World extents used elsewhere in the app: x ∈ [-7680, 7679], z ∈ [4224, 13055]
    // SVG viewBox will be set to [0, 15360] × [0, 8832]
    const WORLD_MIN_X = -7680;
    const WORLD_MIN_Z = 4224;
    const svgX = x - WORLD_MIN_X; // shift to [0, 15360]
    const svgY = z - WORLD_MIN_Z; // shift to [0, 8832]
    return { x: svgX, y: svgY };
  };

  // Track current pixel-per-unit scale so markers can be sized in CSS pixels
  useEffect(() => {
    const updateScale = () => {
      const el = svgRef.current;
      if (!el) return;
      const widthPx = el.clientWidth || el.getBoundingClientRect().width;
      if (widthPx > 0) {
        setSvgScale(widthPx / VIEWBOX_WIDTH);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <style jsx>{`
        @keyframes townPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        @keyframes townGlow {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.4; }
        }
        .town-dot {
          animation: townPulse 2s ease-in-out infinite;
        }
        .town-glow {
          animation: townGlow 3s ease-in-out infinite;
        }
      `}</style>
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

      {/* Europe outline (dimmed) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img 
          src="/heightmapVector-full.png" 
          alt="Europe outline"
          className="w-full h-full object-contain"
          style={{ 
            opacity: 0.28,
            // Warm orange tint, reduce blue/white feel
            filter: 'sepia(85%) saturate(250%) hue-rotate(-10deg) brightness(0.95) contrast(1.05)',
            mixBlendMode: 'multiply'
          }}
        />
      </div>
      
      {/* Town dots overlay (full opacity, constant pixel size) */}
      <svg 
        ref={svgRef}
        viewBox="0 0 15360 8832" 
        className="absolute inset-0 w-full h-full pointer-events-none z-30"
        preserveAspectRatio="xMidYMid meet"
        style={{ opacity: 1 }}
      >
        {!townsLoading && towns.map((town) => {
          if (town.location_x === null || town.location_z === null) return null;

          const coords = convertToMapCoordinates(town.location_x, town.location_z);
          const isCapital = town.is_capital;

          const dotPx = isCapital ? 8 : 6;
          const outlinePx = isCapital ? 14 : 12;
          const haloPx = isCapital ? 18 : 16;
          const strokePx = 2.5;
          const haloStrokePx = 2.5;

          const rDot = dotPx / svgScale;
          const rOutline = outlinePx / svgScale;
          const rHalo = haloPx / svgScale;
          const strokeW = strokePx / svgScale;
          const haloStrokeW = haloStrokePx / svgScale;

          const color = '#f97316'; // orange-500

          return (
            <g key={town.id}>
              {/* White halo for contrast on any background */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r={rHalo}
                fill="none"
                stroke="#ffffff"
                strokeWidth={haloStrokeW}
                strokeOpacity="0.9"
              />
              {/* Outline */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r={rOutline}
                fill="none"
                stroke={color}
                strokeWidth={strokeW}
                strokeOpacity="1"
              />
              {/* Main dot */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r={rDot}
                fill={color}
                opacity="1"
              />
            </g>
          );
        })}
      </svg>

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
            Dive into epic adventures, build legendary kingdoms, and forge unforgettable friendships in our vibrant Nordic realm.
          </p>

          {/* Nordic flag colors accent */}
          <div className="flex justify-center space-x-2 mb-8 animate-fade-in" style={{
            animationDelay: '0.3s'
          }}>
            {/* Sweden - Blue */}
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#006AA7' }}></div>
            {/* Sweden - Yellow */}
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FECC00' }}></div>
            {/* Norway - Red */}
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF2B2D' }}></div>
            {/* Norway - Blue */}
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#002868' }}></div>
            {/* Denmark - Red */}
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#C8102E' }}></div>
            {/* Finland - Blue */}
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#003580' }}></div>
            {/* Iceland - Blue */}
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#02529C' }}></div>
            {/* Iceland - Red */}
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#DC1E35' }}></div>
            {/* White (common in Nordic flags) */}
            <div className="w-3 h-3 rounded-full bg-white border border-gray-300"></div>
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
