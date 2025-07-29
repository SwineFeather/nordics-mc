
import { useNewStatLeaderboard } from '@/hooks/useNewStatLeaderboard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NewStatLeaderboardModalProps {
  statPath: string;
  statLabel: string;
  onClose: () => void;
}

// Helper function to format stat values based on the stat type
const formatStatValue = (value: number, statPath: string): string => {
  if (statPath.includes('play_time')) {
    // Convert ticks to hours
    const hours = Math.floor(value / 72000);
    return `${hours}h`;
  } else if (statPath.includes('_one_cm') || statPath.includes('walk') || statPath.includes('sprint')) {
    // Convert cm to blocks
    const blocks = Math.floor(value / 100);
    return `${blocks.toLocaleString()} blocks`;
  } else {
    return value.toLocaleString();
  }
};

export const NewStatLeaderboardModal = ({ statPath, statLabel, onClose }: NewStatLeaderboardModalProps) => {
  const { leaderboardData, loading } = useNewStatLeaderboard(statPath);

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Top 100 - {statLabel}</DialogTitle>
          <DialogDescription>
            Leaderboard for the {statLabel.toLowerCase()} statistic from the new system.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {loading && (
            <div className="space-y-2">
              {Array.from({ length: 15 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          )}
          {!loading && leaderboardData.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.map(({ uuid, username, value, rank }) => (
                  <TableRow key={`${uuid}-${rank}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center justify-center">
                        {rank <= 3 ? (
                           <Crown className={`w-5 h-5 ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-400' : 'text-yellow-600'}`}/>
                        ) : (
                          rank
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://mc-heads.net/avatar/${uuid}/100`} alt={username} />
                          <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{username}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{formatStatValue(value, statPath)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!loading && leaderboardData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No data available for this statistic in the new system.
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
