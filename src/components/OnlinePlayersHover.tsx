
import React, { useRef, useState } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import PlayerModel3D from './PlayerModel3D';
import type { OnlinePlayer } from '@/hooks/useServerStatus';
import { useProfiles } from '@/hooks/useProfiles';
import { RealTimePlayerData } from '@/hooks/useRealTimePlayerData';

interface OnlinePlayersHoverProps {
  players: OnlinePlayer[];
  loading: boolean;
  children: React.ReactNode;
  onPlayerSelect?: (player: any) => void;
  realTimeData?: RealTimePlayerData[] | null;
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
}

interface PlayerAvatarProps {
  player: OnlinePlayer;
  onPlayerSelect?: (player: any) => void;
  realTimePlayerData?: RealTimePlayerData | null;
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ player, onPlayerSelect, realTimePlayerData }) => {
  const [show3D, setShow3D] = useState(false);
  const { getProfileByUsername } = useProfiles({ fetchAll: false });
  const avatarUrl = `https://mc-heads.net/avatar/${player.name}/32`;

  const handlePlayerClick = () => {
    if (onPlayerSelect) {
      const profile = getProfileByUsername(player.name);
      if (profile) {
        onPlayerSelect(profile);
      }
    }
  };

  return (
    <div className="relative">
      <HoverCard openDelay={50} closeDelay={50}>
        <HoverCardTrigger asChild>
          <div
            className="cursor-pointer transition-all duration-200 hover:scale-105 relative p-2 rounded-md hover:bg-muted/50 group flex items-center space-x-2 bg-muted/20 hover:bg-muted/40 border border-transparent hover:border-border/30 min-w-0 max-w-full"
            onMouseEnter={() => setShow3D(true)}
            onMouseLeave={() => setShow3D(false)}
            onClick={handlePlayerClick}
          >
            <Avatar className="w-8 h-8 flex-shrink-0 border border-white shadow-sm">
              <AvatarImage src={avatarUrl} alt={player.name} />
              <AvatarFallback className="text-xs">
                {player.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">{player.name}</p>
              {realTimePlayerData && (
                <p className="text-xs text-muted-foreground">Lv.{realTimePlayerData.level}</p>
              )}
            </div>
            {/* Real-time status indicator */}
            {realTimePlayerData && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white animate-pulse shadow-sm"></div>
            )}
          </div>
        </HoverCardTrigger>
        <HoverCardContent 
          className="w-auto p-4 bg-background/95 backdrop-blur-sm border shadow-xl rounded-xl"
          side="top"
          sideOffset={10}
        >
          {show3D ? (
            <div className="flex flex-col items-center space-y-2">
              <PlayerModel3D playerName={player.name} realTimeData={realTimePlayerData} />
              <div className="text-center space-y-1">
                <Badge variant="outline" className="text-sm font-medium cursor-pointer hover:bg-primary hover:text-primary-foreground" onClick={handlePlayerClick}>
                  {player.name}
                </Badge>
                {realTimePlayerData && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>World: {realTimePlayerData.world}</div>
                    <div>Level: {realTimePlayerData.level}</div>
                    <div className="flex items-center justify-center space-x-2">
                      <span>❤ {realTimePlayerData.health}/20</span>
                      <span>🍖 {realTimePlayerData.food}/20</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="w-16 h-16 cursor-pointer" onClick={handlePlayerClick}>
                <AvatarImage src={`https://mc-heads.net/avatar/${player.name}/64`} alt={player.name} />
                <AvatarFallback>{player.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="text-center space-y-1">
                <Badge variant="outline" className="text-sm font-medium cursor-pointer hover:bg-primary hover:text-primary-foreground" onClick={handlePlayerClick}>
                  {player.name}
                </Badge>
                {realTimePlayerData && (
                  <div className="text-xs text-muted-foreground">
                    <div>Level {realTimePlayerData.level}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

const OnlinePlayersHover: React.FC<OnlinePlayersHoverProps> = ({ 
  players, 
  loading, 
  children,
  onPlayerSelect,
  realTimeData,
  side = 'bottom',
  sideOffset = 0
}) => {
  if (loading || !players || players.length === 0) {
    return <>{children}</>;
  }

  // Non-portal hover wrapper: keeps content open while moving between trigger and panel
  const [open, setOpen] = useState(false)
  const closeTimerRef = useRef<number | null>(null)

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }
  const scheduleClose = (delay = 700) => {
    clearCloseTimer()
    closeTimerRef.current = window.setTimeout(() => setOpen(false), delay)
  }
  const show = () => {
    clearCloseTimer()
    setOpen(true)
  }
  const hide = () => {
    scheduleClose(700)
  }

  const positionClass = side === 'top' ? 'bottom-full' : side === 'bottom' ? 'top-full' : side === 'left' ? 'right-full' : 'left-full'
  const spacingClass = side === 'top' ? 'mb-0' : side === 'bottom' ? 'mt-0' : side === 'left' ? 'mr-0' : 'ml-0'
  const overlapClass = side === 'top' ? '-mt-2' : side === 'bottom' ? '-mb-2' : side === 'left' ? '-mr-2' : '-ml-2'

  return (
    <div className="relative inline-block pointer-events-auto">
      <div onMouseEnter={show} onMouseLeave={hide}>{children}</div>
      {open && (
        <div className={`absolute ${positionClass} ${spacingClass} left-1/2 -translate-x-1/2 z-50 animate-in fade-in-0 zoom-in-95 duration-200`}
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          <div className={`w-auto max-w-[90vw] p-4 bg-background/95 backdrop-blur-sm border shadow-xl rounded-xl select-text ${overlapClass} transition-all duration-200`}>
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {loading ? 'Loading players...' : `${players.length} players currently online`}
                </p>
              </div>
              <div className="flex flex-wrap justify-start gap-2 max-h-[60vh] overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                {players.slice(0, 24).map((player) => {
                  const realTimePlayerData = realTimeData?.find(rtPlayer => rtPlayer.name === player.name);
                  return (
                    <div key={player.uuid || player.name} className="flex-shrink-0">
                      <PlayerAvatar 
                        player={player} 
                        onPlayerSelect={onPlayerSelect}
                        realTimePlayerData={realTimePlayerData}
                      />
                    </div>
                  );
                })}
              </div>
              {players.length > 24 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{players.length - 24} more players
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlinePlayersHover;
