import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GroupsTab from '@/components/towns/GroupsTab';
import BusinessListingsTab from '@/components/towns/BusinessListingsTab';
import ShopsTab from '@/components/towns/ShopsTab';
import { Building, Building2, Store } from 'lucide-react';

const Markets: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active sub-tab from URL
  const getActiveSubTab = () => {
    if (location.pathname === '/markets/groups') return 'groups';
    if (location.pathname === '/markets/businesses') return 'businesses';
    if (location.pathname === '/markets/shops') return 'shops';
    return 'shops';
  };
  
  const [activeSubTab, setActiveSubTab] = useState<'groups' | 'businesses' | 'shops'>(getActiveSubTab());
  
  const handleSubTabChange = (value: 'groups' | 'businesses' | 'shops') => {
    setActiveSubTab(value);
    switch (value) {
      case 'groups':
        navigate('/markets/groups');
        break;
      case 'businesses':
        navigate('/markets/businesses');
        break;
      case 'shops':
        navigate('/markets/shops');
        break;
    }
  };
  
  return (
    <div className="min-h-[100vh] bg-background py-8">


      {/* Markets Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-8">
          <Tabs value={activeSubTab} onValueChange={(value: 'groups' | 'businesses' | 'shops') => handleSubTabChange(value)} className="w-full">
            <TabsList className="flex justify-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-xl p-1 w-full max-w-2xl mx-auto border border-orange-200 dark:border-orange-800 shadow-lg">
              <TabsTrigger 
                value="shops" 
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:scale-105"
              >
                <Store className="w-4 h-4" />
                Shops
              </TabsTrigger>
              <TabsTrigger 
                value="businesses" 
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:scale-105"
              >
                <Building2 className="w-4 h-4" />
                Business Listings
              </TabsTrigger>
              <TabsTrigger 
                value="groups" 
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:scale-105"
              >
                <Building className="w-4 h-4" />
                Enterprises
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="shops" className="mt-6">
              <ShopsTab />
            </TabsContent>
            
            <TabsContent value="businesses" className="mt-6">
              <BusinessListingsTab />
            </TabsContent>
            
            <TabsContent value="groups" className="mt-6">
              <GroupsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Markets;
