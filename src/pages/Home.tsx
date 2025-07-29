
import { Users, MapPin, Crown, Building } from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import { useServerStatus } from '@/hooks/useServerStatus';
import { useRealTimePlayerData } from '@/hooks/useRealTimePlayerData';
import NewsSection from '@/components/home/NewsSection';
import FeaturesSection, { Feature } from '@/components/home/FeaturesSection';
import CallToActionSection from '@/components/home/CallToActionSection';
import RecentActivityFeed from '@/components/RecentActivityFeed';

const Home = () => {
  const { status, loading } = useServerStatus();
  const { data: realTimeData, loading: realTimeLoading, connected } = useRealTimePlayerData();

  const features: Feature[] = [
    {
      icon: <Crown className="w-8 h-8 text-yellow-500" />,
      title: 'Towny System',
      description: 'Create and manage your own town, invite friends, and build an empire together.',
    },
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: 'Active Community',
      description: 'Join our friendly community of builders, explorers, and adventurers from around the world.',
    },
    {
      icon: <Building className="w-8 h-8 text-green-500" />,
      title: 'Economy System',
      description: 'Trade with other players, create shops, and build your wealth in our dynamic economy.',
    },
    {
      icon: <MapPin className="w-8 h-8 text-purple-500" />,
      title: 'Interactive Map',
      description: 'Explore our world with our detailed interactive map showing towns, nations, and points of interest.',
    },
  ];

  return (
    <>
      <HeroSection />
      <NewsSection />
      
      {/* Recent Activity Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">What's Happening</h2>
              <p className="text-muted-foreground">
                Stay up to date with the latest activities and achievements from our community
              </p>
            </div>
            <RecentActivityFeed 
              activities={realTimeData?.activities || []} 
              loading={realTimeLoading}
              connected={connected}
            />
          </div>
        </div>
      </section>

      <FeaturesSection features={features} />
      <CallToActionSection />
    </>
  );
};

export default Home;
