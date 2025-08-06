
import { Users, MapPin, Crown, Building, Flag } from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import NewsSection from '@/components/home/NewsSection';
import FeaturesSection, { Feature } from '@/components/home/FeaturesSection';

const Home = () => {

  const features: Feature[] = [
    {
      icon: <Crown className="w-8 h-8 text-orange-500" />,
      title: 'Towny System',
      description: 'Create and manage your own town, invite friends, and build an empire together.',
    },
    {
      icon: <Users className="w-8 h-8 text-red-500" />,
      title: 'Active Community',
      description: 'Join our friendly community of builders, explorers, and adventurers from around the world.',
    },
    {
      icon: <Building className="w-8 h-8 text-amber-500" />,
      title: 'Economy System',
      description: 'Trade with other players, create shops, and build your wealth in our dynamic economy.',
    },
    {
      icon: <MapPin className="w-8 h-8 text-orange-600" />,
      title: 'Interactive Map',
      description: 'Explore our world with our detailed interactive map showing towns, nations, and points of interest.',
    },
  ];

  return (
    <>
      <HeroSection />
      <NewsSection />
      <FeaturesSection features={features} />
    </>
  );
};

export default Home;
