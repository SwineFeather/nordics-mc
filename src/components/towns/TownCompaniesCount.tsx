import React, { useState, useEffect } from 'react';
import { TownCompaniesService } from '@/services/townCompaniesService';

interface TownCompaniesCountProps {
  townId: number;
}

const TownCompaniesCount: React.FC<TownCompaniesCountProps> = ({ townId }) => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const companyCount = await TownCompaniesService.getTownCompanyCount(townId);
        setCount(companyCount);
      } catch (error) {
        console.error('Error fetching company count:', error);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, [townId]);

  if (loading) {
    return <span className="text-muted-foreground">...</span>;
  }

  return <span>{count}</span>;
};

export default TownCompaniesCount;

