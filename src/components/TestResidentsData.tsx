import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PlayerTownService } from '@/services/playerTownService';

export const TestResidentsData: React.FC = () => {
  const { profile } = useAuth();
  const [residentsData, setResidentsData] = useState<any[]>([]);
  const [playerData, setPlayerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to fetch from residents table
        const { data, error: residentsError } = await supabase
          .from('residents')
          .select('*')
          .limit(10);

        if (residentsError) {
          console.error('Error fetching residents:', residentsError);
          setError(`Residents table error: ${residentsError.message}`);
        } else {
          console.log('Residents data:', data);
          setResidentsData(data || []);
        }

        // Test PlayerTownService
        if (profile?.minecraft_username) {
          const playerTownData = await PlayerTownService.getPlayerTownData(profile.minecraft_username);
          console.log('PlayerTownService result:', playerTownData);
          setPlayerData(playerTownData);
        }

      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile]);

  if (loading) return <div>Loading residents data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h2 className="text-xl font-bold mb-4">Residents Table Test</h2>
      <p className="mb-4">Current user: {profile?.minecraft_username || 'Not logged in'}</p>
      
      <div className="mb-4">
        <h3 className="font-semibold">PlayerTownService Result:</h3>
        <pre className="bg-blue-100 p-2 rounded text-sm overflow-auto">
          {JSON.stringify(playerData, null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">First 10 residents:</h3>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
          {JSON.stringify(residentsData, null, 2)}
        </pre>
      </div>

      {profile?.minecraft_username && (
        <div className="mb-4">
          <h3 className="font-semibold">Your data in residents table:</h3>
          <pre className="bg-green-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(
              residentsData.find(r => r.name === profile.minecraft_username),
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}; 