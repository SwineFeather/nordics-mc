
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ChatChannel {
  id: string;
  name: string;
  description: string | null;
  decay_days: number;
  created_at: string;
  updated_at: string;
}

// Mockup data for demonstration - minecraft channel first
const mockupChannels = [
  {
    id: 'minecraft-mock',
    name: 'minecraft',
    description: 'Live Minecraft server chat',
    decay_days: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'nation-mock',
    name: 'nation',
    description: 'Nation chat and politics',
    decay_days: 14,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const useChatChannels = () => {
  const { data: channels, isLoading, error } = useQuery({
    queryKey: ['chatChannels'],
    queryFn: async (): Promise<ChatChannel[]> => {
      const { data, error } = await supabase
        .from('chat_channels')
        .select('*')
        .order('name');

      if (error) throw new Error(error.message);
      
      // Combine real channels with mockup channels, minecraft first
      const realChannels = data || [];
      return [...mockupChannels, ...realChannels];
    },
  });

  return { channels: channels || [], isLoading, error };
};
