
import { Card, CardContent } from '@/components/ui/card';
import OnlinePlayersHover from '@/components/OnlinePlayersHover';
import type { ServerStatus } from '@/hooks/useServerStatus';
import type { PlayerProfile } from '@/types/player';

interface ServerStatsSectionProps {
  status: ServerStatus | null;
  loading: boolean;
  onPlayerSelect?: (profile: PlayerProfile) => void;
}

const ServerStatsSection: React.FC<ServerStatsSectionProps> = ({ status, loading, onPlayerSelect }) => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold gradient-text mb-4">Server Statistics</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join our thriving community and be part of something amazing
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">
                {loading ? '...' : status?.online ? 'Online' : 'Offline'}
              </div>
              <p className="text-sm text-muted-foreground">Server Status</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <OnlinePlayersHover 
                players={status?.players?.list || []} 
                loading={loading}
                onPlayerSelect={onPlayerSelect}
              >
                <div className="cursor-pointer transition-transform hover:scale-105">
                  <div className="text-3xl font-bold text-blue-500 mb-2">
                    {loading ? '...' : `${status?.players?.online || 0}/${status?.players?.max || 100}`}
                  </div>
                  <p className="text-sm text-muted-foreground">Players Online</p>
                </div>
              </OnlinePlayersHover>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-500 mb-2">
                {loading ? '...' : '15'} {/* This could be dynamic in the future */}
              </div>
              <p className="text-sm text-muted-foreground">Active Towns</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-500 mb-2">
                {loading ? '...' : '3'} {/* This could be dynamic in the future */}
              </div>
              <p className="text-sm text-muted-foreground">Nations</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ServerStatsSection;
