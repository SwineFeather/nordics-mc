import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Pickaxe, Coins, Award, BarChart3, AlertTriangle } from 'lucide-react';

interface PlayerStatsProps {
  stats: Record<string, number>;
  onViewAllStats: () => void;
  loading?: boolean;
}

const PlayerStats = ({ stats, onViewAllStats, loading }: PlayerStatsProps) => {
  if (loading) {
    return <div className="text-center py-8">Loading player statistics...</div>;
  }

  // WIP notice: hide unreliable stats for now
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Statistics (Work in progress)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          We’re rebuilding the statistics experience. Current data is unreliable and this section is temporarily disabled.
        </p>
      </CardContent>
    </Card>
  );
};

export default PlayerStats;
