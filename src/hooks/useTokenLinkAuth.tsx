
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/wiki';

interface TokenLinkProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  minecraft_username?: string;
  bio?: string;
  avatar_url?: string;
}

export const useTokenLinkAuth = () => {
  const [profile, setProfile] = useState<TokenLinkProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTokenLinkUser, setIsTokenLinkUser] = useState(false);

  useEffect(() => {
    const checkTokenLinkAuth = () => {
      const tokenLinkProfileId = localStorage.getItem("tokenlink_profile_id");
      const playerUuid = localStorage.getItem("player_uuid");
      const playerName = localStorage.getItem("player_name");
      const profileData = localStorage.getItem("profile");

      if (tokenLinkProfileId && playerUuid && playerName) {
        setIsTokenLinkUser(true);
        
        if (profileData) {
          try {
            const parsedProfile = JSON.parse(profileData);
            setProfile(parsedProfile);
          } catch (e) {
            console.error("Error parsing TokenLink profile data:", e);
          }
        }
      }
      
      setLoading(false);
    };

    checkTokenLinkAuth();
  }, []);

  const updateProfile = async (updates: Partial<TokenLinkProfile>) => {
    if (!profile?.id) return { error: new Error('No profile ID found') };
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (!error && data) {
        setProfile(data);
        localStorage.setItem("profile", JSON.stringify(data));
      }
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = () => {
    localStorage.removeItem("tokenlink_profile_id");
    localStorage.removeItem("player_uuid");
    localStorage.removeItem("player_name");
    localStorage.removeItem("profile");
    setProfile(null);
    setIsTokenLinkUser(false);
  };

  return {
    profile,
    loading,
    isTokenLinkUser,
    updateProfile,
    signOut,
    playerUuid: localStorage.getItem("player_uuid"),
    playerName: localStorage.getItem("player_name"),
  };
};
