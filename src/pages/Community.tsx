
import { useSearchParams } from 'react-router-dom';
import CommunityDashboard from '@/components/community/CommunityDashboard';

const Community = () => {
  const [searchParams] = useSearchParams();
  const playerParam = searchParams.get('player');

  return (
    <div className="min-h-screen bg-background">
      <CommunityDashboard selectedPlayer={playerParam} />
    </div>
  );
};

export default Community;
