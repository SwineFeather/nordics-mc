import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, Trophy, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { STAT_CATEGORIES } from '@/utils/statCategories';
import { getStatIcon, getCategoryIcon } from '@/utils/statIcons';

interface AllStatsModalProps {
  statsWithMeta: Array<{ key: string; value: number; name: string; category: string }>;
  loading?: boolean;
  onClose: () => void;
}

type FilterType = 'all' | 'high-values';

const AllStatsModal = ({ statsWithMeta, loading, onClose }: AllStatsModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['general', 'building', 'mining', 'combat']));

  // Group stats by category, with fallback for uncategorized
  const categorizedStats = useMemo(() => {
    const groups: Record<string, Array<{ key: string; value: number; name: string; category: string }>> = {};
    Object.keys(STAT_CATEGORIES).forEach(categoryKey => {
      groups[categoryKey] = [];
    });
    statsWithMeta.forEach(stat => {
      if (STAT_CATEGORIES[stat.category]) {
        groups[stat.category].push(stat);
      } else {
        if (!groups['uncategorized']) groups['uncategorized'] = [];
        groups['uncategorized'].push(stat);
      }
    });
    Object.values(groups).forEach(arr => arr.sort((a, b) => b.value - a.value));
    return groups;
  }, [statsWithMeta]);

  const allCategories = [
    ...Object.values(STAT_CATEGORIES),
    { key: 'uncategorized', name: 'Other', color: 'text-gray-600', bgColor: 'bg-gray-100', description: 'Uncategorized stats' }
  ];

  // Apply filters
  const filteredStats = useMemo(() => {
    const filtered: Record<string, Array<{ key: string; value: number; name: string; category: string }>> = {};
    Object.entries(categorizedStats).forEach(([categoryKey, stats]) => {
      if (selectedCategory !== 'all' && selectedCategory !== categoryKey) return;
      const categoryFiltered = stats.filter(stat => {
        const matchesSearch = searchTerm === '' ||
          stat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stat.key.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;
        if (filterType === 'high-values') return stat.value >= 100;
        return true;
      });
      if (categoryFiltered.length > 0) filtered[categoryKey] = categoryFiltered;
    });
    return filtered;
  }, [categorizedStats, searchTerm, selectedCategory, filterType]);

  const totalFilteredStats = Object.values(filteredStats).reduce((sum, stats) => sum + stats.length, 0);

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              All Statistics
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">Loading all player statistics...</div>
        </DialogContent>
      </Dialog>
    );
  }

  const formatStatValue = (value: number, key: string): string => {
    if (key.includes('time') && (key.includes('play') || key.includes('custom'))) {
      const days = Math.floor(value / 24);
      const hours = Math.floor(value % 24);
      if (days > 0) return `${days}d ${hours}h`;
      return `${hours}h`;
    }
    if (key.includes('distance') || key.includes('walk') || key.includes('sprint') || key.includes('swim')) {
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}km`;
      }
      return `${value}m`;
    }
    return value.toLocaleString();
  };

  const toggleCategory = (categoryKey: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryKey)) {
      newExpanded.delete(categoryKey);
    } else {
      newExpanded.add(categoryKey);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            All Statistics
          </DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="flex-shrink-0 space-y-4 border-b pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search statistics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {allCategories.map(category => (
                    <SelectItem key={category.key} value={category.key}>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(category.key, "w-3 h-3")}
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stats</SelectItem>
                  <SelectItem value="high-values">High Values</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats Content */}
        <div className="flex-1 overflow-y-auto">
          {Object.keys(filteredStats).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || selectedCategory !== 'all' || filterType !== 'all' 
                ? 'No statistics found matching your filters.' 
                : 'No statistics available.'}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(filteredStats).map(([categoryKey, stats]) => {
                const category = allCategories.find(c => c.key === categoryKey) || { name: 'Other', color: 'text-gray-600', bgColor: 'bg-gray-100', description: 'Uncategorized stats', key: 'uncategorized' };
                const isExpanded = expandedCategories.has(categoryKey);
                return (
                  <Collapsible 
                    key={categoryKey} 
                    open={isExpanded}
                    onOpenChange={() => toggleCategory(categoryKey)}
                  >
                    <CollapsibleTrigger asChild>
                      <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${category.bgColor}`}>
                                {getCategoryIcon(category.key, `w-5 h-5 ${category.color}`)}
                              </div>
                              <div>
                                <CardTitle className="text-lg">{category.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{category.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{stats.length} stats</Badge>
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                        {stats.map((stat) => (
                          <Card key={stat.key} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  {getStatIcon(stat.key, `w-4 h-4 ${category.color}`)}
                                  <span className="font-medium text-sm truncate" title={stat.name}>
                                    {stat.name}
                                  </span>
                                </div>
                              </div>
                              <div className="text-xl font-bold text-primary">
                                {formatStatValue(stat.value, stat.key)}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {totalFilteredStats} statistics
          </div>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AllStatsModal;
