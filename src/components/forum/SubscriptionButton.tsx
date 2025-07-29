import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, BellOff, ChevronDown } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionButtonProps {
  subscriptionType: 'category' | 'user' | 'tag';
  targetId: string;
  targetName?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showFrequency?: boolean;
  showText?: boolean;
}

const FREQUENCY_OPTIONS = [
  { value: 'instant', label: 'Instant' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'never', label: 'Never' }
];

export const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({
  subscriptionType,
  targetId,
  targetName,
  variant = 'outline',
  size = 'sm',
  showFrequency = false,
  showText = false
}) => {
  const { isSubscribed, subscribeToContent, unsubscribeFromContent, getSubscriptionStatus } = useNotifications();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const isCurrentlySubscribed = isSubscribed(subscriptionType, targetId);
  const subscription = getSubscriptionStatus(subscriptionType, targetId);

  const handleSubscribe = async (frequency: string = 'instant') => {
    try {
      setLoading(true);
      await subscribeToContent(subscriptionType, targetId, frequency);
      toast({
        title: 'Subscribed',
        description: `You are now subscribed to ${targetName || subscriptionType} notifications.`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to subscribe. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      setLoading(true);
      await unsubscribeFromContent(subscriptionType, targetId);
      toast({
        title: 'Unsubscribed',
        description: `You are no longer subscribed to ${targetName || subscriptionType} notifications.`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unsubscribe. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFrequencyChange = async (frequency: string) => {
    if (frequency === 'never') {
      await handleUnsubscribe();
    } else {
      await handleSubscribe(frequency);
    }
  };

  const getSubscriptionLabel = () => {
    if (!isCurrentlySubscribed) {
      return 'Subscribe';
    }
    
    if (!showFrequency) {
      return 'Subscribed';
    }
    
    const frequency = subscription?.frequency || 'instant';
    const frequencyLabel = FREQUENCY_OPTIONS.find(f => f.value === frequency)?.label || frequency;
    return `Subscribed (${frequencyLabel})`;
  };

  const getSubscriptionIcon = () => {
    return isCurrentlySubscribed ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />;
  };

  if (showFrequency && isCurrentlySubscribed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} disabled={loading} className="flex items-center gap-2">
            {getSubscriptionIcon()}
            {showText && getSubscriptionLabel()}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleFrequencyChange('instant')}>
            Instant
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFrequencyChange('hourly')}>
            Hourly
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFrequencyChange('daily')}>
            Daily
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFrequencyChange('weekly')}>
            Weekly
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFrequencyChange('never')} className="text-destructive">
            Unsubscribe
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={isCurrentlySubscribed ? handleUnsubscribe : () => handleSubscribe()}
      disabled={loading}
      className="flex items-center gap-2"
      title={showText ? undefined : getSubscriptionLabel()}
    >
      {getSubscriptionIcon()}
      {showText && getSubscriptionLabel()}
      {isCurrentlySubscribed && showText && (
        <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
          {subscription?.frequency || 'instant'}
        </Badge>
      )}
    </Button>
  );
}; 