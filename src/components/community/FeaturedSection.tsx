
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Users, Building, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FeaturedPlayer {
  uuid: string;
  name: string;
  town_name: string;
  nation_name: string;
  balance: number;
  is_mayor: boolean;
  is_king: boolean;
  last_login: string;
  activity_score: number;
}

const FeaturedSection = () => {
  const [featuredPlayers, setFeaturedPlayers] = useState<FeaturedPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedPlayers = async () => {
      try {
        const { data, error } = await supabase
          .from('residents')
          .select('*')
          .order('balance', { ascending: false })
          .limit(4);

        if (error) throw error;
        setFeaturedPlayers(data || []);
      } catch (error) {
        console.error('Error fetching featured players:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPlayers();
  }, []);

  if (loading) {
    return <div className="animate-pulse">Loading featured players...</div>;
  }

  const wealthiestPlayer = featuredPlayers[0];
  const mayors = featuredPlayers.filter(p => p.is_mayor);
  const kings = featuredPlayers.filter(p => p.is_king);
  const mostActivePlayer = featuredPlayers.sort((a, b) => b.activity_score - a.activity_score)[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Wealthiest Player
          </CardTitle>
        </CardHeader>
        <CardContent>
          {wealthiestPlayer && (
            <div>
              <div className="font-semibold">{wealthiestPlayer.name}</div>
              <div className="text-sm text-muted-foreground">
                Balance: ${wealthiestPlayer.balance.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {wealthiestPlayer.town_name}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Building className="h-4 w-4 text-blue-500" />
            Featured Mayor
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mayors[0] && (
            <div>
              <div className="font-semibold">{mayors[0].name}</div>
              <div className="text-sm text-muted-foreground">
                Mayor of {mayors[0].town_name}
              </div>
              <Badge variant="secondary" className="mt-1">Mayor</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Crown className="h-4 w-4 text-purple-500" />
            Featured King
          </CardTitle>
        </CardHeader>
        <CardContent>
          {kings[0] && (
            <div>
              <div className="font-semibold">{kings[0].name}</div>
              <div className="text-sm text-muted-foreground">
                King of {kings[0].nation_name}
              </div>
              <Badge variant="secondary" className="mt-1">King</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-green-500" />
            Most Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mostActivePlayer && (
            <div>
              <div className="font-semibold">{mostActivePlayer.name}</div>
              <div className="text-sm text-muted-foreground">
                Activity Score: {mostActivePlayer.activity_score}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {mostActivePlayer.town_name}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeaturedSection;
