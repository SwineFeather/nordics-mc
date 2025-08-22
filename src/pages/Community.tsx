
import React, { useState } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NationsTab from '@/components/towns/NationsTab';
import TownsTab from '@/components/towns/TownsTab';
import PlayerDirectory from '@/components/community/PlayerDirectory';
import { Crown, MapPin, Users } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';

const Community = () => {
  const [searchParams] = useSearchParams();
  const playerParam = searchParams.get('player');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use the page title hook to set dynamic titles
  usePageTitle();
  
  // Determine active tab from URL
  const getActiveTab = () => {
    if (location.pathname === '/community/nations') return 'nations';
    if (location.pathname === '/community/towns') return 'towns';
    if (location.pathname === '/community/players') return 'players';
    return 'players';
  };
  
  const [activeTab, setActiveTab] = useState<'nations' | 'towns' | 'players'>(getActiveTab());
  
  const handleTabChange = (value: 'nations' | 'towns' | 'players') => {
    setActiveTab(value);
    switch (value) {
      case 'nations':
        navigate('/community/nations');
        break;
      case 'towns':
        navigate('/community/towns');
        break;
      case 'players':
        navigate('/community/players');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">


      {/* Community Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-8">
          <Tabs value={activeTab} onValueChange={(value: 'nations' | 'towns' | 'players') => handleTabChange(value)} className="w-full">
            <TabsList className="flex justify-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-1 w-full max-w-2xl mx-auto border border-blue-200 dark:border-blue-800 shadow-lg">
              <TabsTrigger 
                value="players" 
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:scale-105"
              >
                <Users className="w-4 h-4" />
                Players
              </TabsTrigger>
              <TabsTrigger 
                value="towns" 
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:scale-105"
              >
                <MapPin className="w-4 h-4" />
                Towns
              </TabsTrigger>
              <TabsTrigger 
                value="nations" 
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:scale-105"
              >
                <Crown className="w-4 h-4" />
                Nations
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="players" className="mt-6">
              <PlayerDirectory selectedPlayer={playerParam} />
            </TabsContent>
            
            <TabsContent value="towns" className="mt-6">
              <TownsTab />
            </TabsContent>
            
            <TabsContent value="nations" className="mt-6">
              <NationsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Community;
