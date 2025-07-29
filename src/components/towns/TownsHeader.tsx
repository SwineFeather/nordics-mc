
import React from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Users, Heart, Search } from 'lucide-react';

interface TownsHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const TownsHeader: React.FC<TownsHeaderProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="text-center mb-12">
      <div className="mb-6">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          <span className="gradient-text">Nyrvalos</span>
        </h1>
        <h2 className="text-2xl md:text-3xl font-medium text-muted-foreground mb-4">
          Where Nations Rise & Communities Thrive
        </h2>
      </div>
      
      <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
        Discover the rich tapestry of nations, build thriving towns, and forge lasting alliances in our vibrant world. 
        Every player has a story to tell, every town has a legacy to build.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>Explore Nations</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>Join Communities</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Heart className="w-4 h-4" />
          <span>Build Your Legacy</span>
        </div>
      </div>
      
      <div className="max-w-md mx-auto relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search nations, towns, or players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-2xl h-12 text-base bg-background border-border"
        />
      </div>
    </div>
  );
};

export default TownsHeader;
