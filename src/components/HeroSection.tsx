
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useServerStatus } from '@/hooks/useServerStatus';
import { useTownLocations } from '@/hooks/useTownLocations';
import OnlinePlayersHover from './OnlinePlayersHover';
import NordicsLogo from './NordicsLogo';
import ServerIPModal from './ServerIPModal';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const { status, loading: serverStatusLoading } = useServerStatus();
  const { towns, loading: townsLoading } = useTownLocations();
  const [showServerModal, setShowServerModal] = useState(false);
  const navigate = useNavigate();
  const [selectedTown, setSelectedTown] = useState<null | (typeof towns)[number]>(null);
  const [selectedPosition, setSelectedPosition] = useState<null | { x: number; y: number }>(null);
  const [selectedCursor, setSelectedCursor] = useState<null | { x: number; y: number }>(null);
  const [hoveredTown, setHoveredTown] = useState<null | (typeof towns)[number]>(null);
  const [hoveredCursor, setHoveredCursor] = useState<null | { x: number; y: number }>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );
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
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 640);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-24 lg:py-40 min-h-[90vh]">
      <style>{`
        @keyframes townPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        @keyframes townGlow {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.4; }
        }
        @keyframes townDotBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .town-dot {
          animation: townPulse 2s ease-in-out infinite;
        }
        .town-glow {
          animation: townGlow 3s ease-in-out infinite;
        }
        .town-dot-breathe {
          transform-origin: center;
          transform-box: fill-box;
          animation: townDotBreathe 3s ease-in-out infinite;
        }
      `}</style>
      {/* Animated background elements with Nordic colors */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse-glow" style={{
          animationDelay: '1s'
        }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl animate-pulse-glow" style={{
          animationDelay: '2s'
        }}></div>
      </div>

      {/* Europe outline (tinted). Stronger in light mode, subtler in dark mode */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img 
          src="/heightmapVector-full.png" 
          alt="Europe outline"
          className="w-full h-full object-contain opacity-20 dark:opacity-10"
          style={{ 
            filter: 'sepia(100%) saturate(600%) hue-rotate(-18deg) brightness(0.68) contrast(1.15) blur(1px)'
          }}
        />
      </div>
      
      {/* Town dots overlay (full opacity, constant pixel size) */}
      <svg 
        ref={svgRef}
        viewBox="0 0 15360 8832" 
        className="absolute inset-0 w-full h-full z-10"
        preserveAspectRatio="xMidYMid meet"
        style={{ opacity: 1 }}
      >
        <defs>
          <filter id="dot-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
          </filter>
        </defs>
        {!townsLoading && towns.map((town) => {
          if (town.location_x === null || town.location_z === null) return null;

          const coords = convertToMapCoordinates(town.location_x, town.location_z);
          // Size by balance: 0 => smallest, 5000 => largest
          const clampedBalance = Math.max(0, Math.min(5000, town.balance ?? 0));
          const balanceFactor = clampedBalance / 5000;
          const sizeFactor = isMobile ? 0.7 : 1; // reduce on small screens

          // Define min/max dot size in CSS pixels (desktop)
          const minDotPx = 2.5;
          const maxDotPx = 9;

          const dotPx = (minDotPx + (maxDotPx - minDotPx) * balanceFactor) * sizeFactor;
          const outlinePx = dotPx * 2.0;
          const haloPx = dotPx * 2.6;
          const strokePx = Math.max(1, 2.0 * sizeFactor);
          const haloStrokePx = Math.max(1, 2.0 * sizeFactor);

          const rDot = dotPx / svgScale;
          const rOutline = outlinePx / svgScale;
          const rHalo = haloPx / svgScale;
          const strokeW = strokePx / svgScale;
          const haloStrokeW = haloStrokePx / svgScale;

          // Increase interactive hitbox in CSS pixels, convert to SVG units
          const hitboxPx = isMobile ? 22 : 16;
          const rHit = hitboxPx / svgScale;

          const color = '#f97316'; // orange-500

          // Opacities (slightly reduced on mobile)
          const outlineOpacity = isMobile ? 0.3 : 0.35;
          const haloOpacity = isMobile ? 0.12 : 0.18;
          const dotOpacity = isMobile ? 0.22 : 0.27;

          return (
            <g key={town.id} style={{ pointerEvents: 'auto', cursor: 'pointer' }}
               onClick={(e) => {
                 setSelectedTown({ ...town });
                 setSelectedPosition({ x: coords.x, y: coords.y });
                 if (sectionRef.current) {
                   const rect = sectionRef.current.getBoundingClientRect();
                   setSelectedCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                 }
               }}
               onMouseEnter={(e) => {
                 setHoveredTown({ ...town });
                 if (sectionRef.current) {
                   const rect = sectionRef.current.getBoundingClientRect();
                   setHoveredCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                 }
               }}
               onMouseMove={(e) => {
                 if (sectionRef.current) {
                   const rect = sectionRef.current.getBoundingClientRect();
                   setHoveredCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                 }
               }}
               onMouseLeave={() => {
                 setHoveredTown(null);
                 setHoveredCursor(null);
               }}
            >
              {/* Invisible larger hit area to make small dots easier to click */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r={rHit}
                fill="transparent"
                style={{ pointerEvents: 'all' }}
              />
              {/* White halo for contrast on any background */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r={rHalo}
                fill="none"
                stroke="#ffffff"
                strokeWidth={haloStrokeW}
                strokeOpacity={haloOpacity}
              />
              {/* Outline */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r={rOutline}
                fill="none"
                stroke={color}
                strokeWidth={strokeW}
                strokeOpacity={outlineOpacity}
              />
              {/* Main dot */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r={rDot}
                fill={color}
                opacity={dotOpacity}
                filter="url(#dot-blur)"
                className="town-dot-breathe"
              />
            </g>
          );
        })}
      </svg>

      {/* Popup for selected town */}
      {selectedTown && selectedCursor && (
        <div
          className="absolute z-40"
          style={{
            left: Math.max(8, Math.min(window.innerWidth - 280, selectedCursor.x + 10)),
            top: Math.max(8, selectedCursor.y - 10)
          }}
        >
          <div className="rounded-xl border border-white/20 dark:border-white/10 shadow-md bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md px-3 py-2 min-w-[220px] max-w-[280px]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{selectedTown.name}</div>
                <div className="mt-0.5 flex items-center gap-2">
                  {selectedTown.is_capital && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-500/30">Capital</span>
                  )}
                  {selectedTown.nation_name && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-200/50 dark:bg-neutral-800/50 border border-white/20 dark:border-white/10 text-neutral-700 dark:text-neutral-200">{selectedTown.nation_name}</span>
                  )}
                </div>
                <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">
                  ({selectedTown.location_x}, {selectedTown.location_z})
                </div>
              </div>
              <button
                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                onClick={() => setSelectedTown(null)}
              >
                ×
              </button>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                className="text-xs px-2 py-1 rounded-md bg-orange-500/80 text-white backdrop-blur-sm hover:bg-orange-500/90"
                onClick={() => navigate(`/town/${encodeURIComponent(selectedTown.name)}`)}
              >
                Open
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fancy quick tooltip on hover */}
      {hoveredTown && hoveredCursor && (
        <div
          className="absolute z-40 pointer-events-none"
          style={{
            left: Math.max(8, Math.min(window.innerWidth - 220, hoveredCursor.x + 10)),
            top: Math.max(8, hoveredCursor.y - 28)
          }}
        >
          <div className="px-2 py-1 rounded-lg bg-white/70 dark:bg-neutral-900/60 border border-white/20 dark:border-white/10 backdrop-blur-md shadow-sm">
            <div className="text-[11px] font-medium text-neutral-900 dark:text-neutral-50">
              {hoveredTown.name}
            </div>
            {hoveredTown.nation_name && (
              <div className="text-[10px] text-neutral-600 dark:text-neutral-300">{hoveredTown.nation_name}</div>
            )}
          </div>
        </div>
      )}

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-none">
        <div className="text-center">
          {/* Logo above heading */}
          <div className="flex justify-center mb-6">
            <NordicsLogo size="lg" className="shrink-0 w-20 h-20 md:w-24 md:h-24" />
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium mb-6 animate-fade-in">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Nordics Minecraft</span>
          </h1>

          {/* Subtitle - simplified */}
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in" style={{
            animationDelay: '0.2s'
          }}>
            Build a thriving town. Start companies, make money, and grow. Form alliances, face rivals, and shape the world.
          </p>

          

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in pointer-events-none" style={{
            animationDelay: '0.4s'
          }}>
            <Button size="lg" className="backdrop-blur-sm bg-gradient-to-r from-orange-500/85 to-red-500/85 hover:from-orange-500/95 hover:to-red-500/95 text-white px-8 py-4 rounded-2xl text-lg font-medium hover-lift glow-primary group pointer-events-auto" onClick={() => setShowServerModal(true)}>
              Join nordics.world
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="backdrop-blur-sm bg-white/30 dark:bg-neutral-900/30 border-2 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-white/40 dark:hover:bg-neutral-900/40 px-8 py-4 rounded-2xl text-lg font-medium hover-lift pointer-events-auto" onClick={() => window.open('https://map.nordics.world', '_blank')}>
              View Live Map
            </Button>
          </div>

          {/* Combined server status + active players (smaller, semi-transparent) under buttons */}
          <div className="flex justify-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
            {status?.online && (
              <OnlinePlayersHover players={playersList} loading={serverStatusLoading} side="top" sideOffset={2}>
                <div className="inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 bg-white/20 dark:bg-neutral-900/20 backdrop-blur-sm border border-orange-300/60 dark:border-orange-800/60 text-orange-800 dark:text-orange-200 cursor-pointer pointer-events-auto">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="font-medium">Online</span>
                  <span className="text-sm opacity-80">• {playersOnline} Players</span>
                </div>
              </OnlinePlayersHover>
            )}
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
