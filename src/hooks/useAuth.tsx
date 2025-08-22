
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { UserRole } from '@/types/wiki';
import { useTokenLinkAuth } from './useTokenLinkAuth';
import { ProfileService, ProfileAuthData } from '@/services/profileService';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  username?: string | null;
  role: UserRole;
  avatar_url: string | null;
  bio?: string | null;
  minecraft_username?: string | null;
  anonymous_mode?: boolean | null;
  silent_join_leave?: boolean | null;
  can_login_with_username?: boolean;
}

// Auth cleanup utility
const cleanupAuthState = () => {
  try {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.log('Auth cleanup error:', error);
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Use TokenLink auth hook
  const tokenLinkAuth = useTokenLinkAuth();

  useEffect(() => {
    // Setting up auth listeners
    
    // Check for TokenLink authentication first
    if (tokenLinkAuth.isTokenLinkUser && tokenLinkAuth.profile) {
      console.log('useAuth: TokenLink user detected, syncing with Supabase');
      
      // Try to get or create profile for TokenLink user
      handleTokenLinkProfile();
      
      return;
    }
    
    // Also check localStorage directly for TokenLink data
    const checkStoredTokenLinkData = () => {
      const playerUuid = localStorage.getItem("player_uuid");
      const playerName = localStorage.getItem("player_name");
      const profileData = localStorage.getItem("profile");
      
      if (playerUuid && playerName) {
        console.log('useAuth: Found stored TokenLink data, setting up authentication');
        
        // Create a basic profile from stored data
        const basicProfile = {
          id: localStorage.getItem("tokenlink_profile_id") || playerUuid,
          email: playerName + '@tokenlink.local',
          full_name: playerName,
          username: playerName,
          role: 'member' as UserRole,
          avatar_url: null,
          bio: null,
          minecraft_username: playerName,
          can_login_with_username: false,
        };
        
        setProfile(basicProfile);
        
        // Create a user-like object for TokenLink users
        const tokenLinkUser = {
          id: basicProfile.id,
          email: basicProfile.email,
        } as User;
        
        setUser(tokenLinkUser);
        setLoading(false);
        return;
      }
    };
    
    // Check stored data first
    checkStoredTokenLinkData();
    
    // Regular Supabase auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Initial session check
      
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Auth state changed
        
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // User signed in, loading profile
          setTimeout(() => {
            loadUserProfile(session.user.id);
          }, 0);
        } else {
          // User signed out or no session
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [tokenLinkAuth.isTokenLinkUser, tokenLinkAuth.profile]);

  // Additional effect to handle TokenLink auth state changes
  useEffect(() => {
    if (tokenLinkAuth.isTokenLinkUser && tokenLinkAuth.profile && !profile) {
      console.log('useAuth: TokenLink profile updated, syncing state');
      handleTokenLinkProfile();
    }
  }, [tokenLinkAuth.isTokenLinkUser, tokenLinkAuth.profile, profile]);

  // Debug logging for authentication state
  useEffect(() => {
    console.log('useAuth: Authentication state changed:', {
      hasUser: !!user,
      hasProfile: !!profile,
      isTokenLinkUser: tokenLinkAuth.isTokenLinkUser,
      hasTokenLinkProfile: !!tokenLinkAuth.profile,
      hasStoredTokenLinkData: !!(localStorage.getItem("player_uuid") && localStorage.getItem("player_name")),
      isAuthenticated: !!user || (tokenLinkAuth.isTokenLinkUser && !!tokenLinkAuth.profile) || !!(localStorage.getItem("player_uuid") && localStorage.getItem("player_name"))
    });
  }, [user, profile, tokenLinkAuth.isTokenLinkUser, tokenLinkAuth.profile]);

  const handleTokenLinkProfile = async () => {
    try {
      const playerUuid = tokenLinkAuth.playerUuid;
      const playerName = tokenLinkAuth.playerName;
      
      if (!playerUuid || !playerName) {
        console.error('Missing player UUID or name for TokenLink user');
        setLoading(false);
        return;
      }

      // First, try to get existing profile
      let existingProfile = await ProfileService.getProfileByPlayerUuid(playerUuid);
      
      if (!existingProfile) {
        // Profile doesn't exist, create one
        console.log('Creating new profile for TokenLink user:', playerName);
        existingProfile = await ProfileService.createTokenLinkProfile({
          player_uuid: playerUuid,
          player_name: playerName
        });
        
        if (existingProfile) {
          console.log('Successfully created profile for TokenLink user');
        }
      }

      if (existingProfile) {
        // Create user-like object for TokenLink users
        const tokenLinkUser = {
          id: existingProfile.id,
          email: existingProfile.email,
        } as User;
        
        setProfile({
          id: existingProfile.id,
          email: existingProfile.email,
          full_name: existingProfile.full_name,
          username: existingProfile.username || null,
          role: existingProfile.role as UserRole,
          avatar_url: existingProfile.avatar_url || null,
          bio: existingProfile.bio || null,
          minecraft_username: existingProfile.minecraft_username || null,
          can_login_with_username: existingProfile.can_login_with_username,
        });
        setUser(tokenLinkUser);
        
        // Store the profile in localStorage for TokenLink auth
        localStorage.setItem("profile", JSON.stringify(existingProfile));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error handling TokenLink profile:', error);
      setLoading(false);
    }
  };

  const tryEstablishSupabaseSession = async (tokenLinkProfile: any) => {
    try {
      console.log('Attempting to establish persistent Supabase session for TokenLink user');
      
      // Check if user already has a Supabase auth account
      const { data: existingUser } = await supabase.auth.admin.getUserById(tokenLinkProfile.id);
      
      if (existingUser) {
        console.log('TokenLink user already has Supabase auth account');
        return;
      }
      
      // For now, we'll rely on the profile-based authentication
      // In a future phase, we can implement proper session creation
      console.log('TokenLink user authenticated via profile system');
      
    } catch (error) {
      console.log('Could not establish Supabase session, continuing with TokenLink auth:', error);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      // Loading profile for user
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Profile query result

      if (error) {
        console.error('useAuth: Error loading profile:', error);
        throw error;
      }
      
      // Profile loaded successfully
      
      setProfile(data);
    } catch (error) {
      console.error('useAuth: Error loading profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Sign out during sign in failed:', err);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  };

  const signInWithUsername = async (username: string, password: string) => {
    try {
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Sign out during sign in failed:', err);
      }

      // Authenticate using username and password
      const profile = await ProfileService.authenticateByUsername(username, password);
      
      if (!profile) {
        throw new Error('Invalid username or password');
      }

      // Create a user-like object for username-based auth
      const usernameUser = {
        id: profile.id,
        email: profile.email,
      } as User;
      
      setUser(usernameUser);
      setProfile({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        username: profile.username || null,
        role: profile.role as UserRole,
        avatar_url: profile.avatar_url || null,
        bio: profile.bio || null,
        minecraft_username: profile.minecraft_username || null,
        can_login_with_username: profile.can_login_with_username,
      });

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);

      return { data: { user: usernameUser }, error: null };
    } catch (error) {
      console.error('Username sign in error:', error);
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      cleanupAuthState();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      return { data, error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      // Handle TokenLink logout
      if (tokenLinkAuth.isTokenLinkUser) {
        tokenLinkAuth.signOut();
        setUser(null);
        setProfile(null);
        window.location.href = '/';
        return { error: null };
      }

      // Disconnect from Minecraft WebSocket before signing out
      if ((window as any).disconnectFromMinecraft) {
        (window as any).disconnectFromMinecraft();
      }
      
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Sign out error:', err);
      }
      
      window.location.href = '/';
      
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    // Handle TokenLink profile updates
    if (tokenLinkAuth.isTokenLinkUser) {
      const result = await tokenLinkAuth.updateProfile(updates);
      if (!result.error && result.data) {
        setProfile({
          id: result.data.id,
          email: result.data.email,
          full_name: result.data.full_name,
          username: result.data.username || null,
          role: result.data.role as UserRole,
          avatar_url: result.data.avatar_url || null,
          bio: result.data.bio || null,
          minecraft_username: result.data.minecraft_username || null,
        });
      }
      return result;
    }

    if (!user) return { error: new Error('Not authenticated') };
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
    }
    
    return { data, error };
  };

  const setPassword = async (password: string) => {
    if (!profile?.id) {
      return { error: new Error('No profile ID found') };
    }

    try {
      const success = await ProfileService.setPassword(profile.id, password);
      
      if (success) {
        // Update local profile to reflect password change
        setProfile(prev => prev ? { ...prev, can_login_with_username: true } : null);
        return { success: true };
      } else {
        return { error: new Error('Failed to set password') };
      }
    } catch (error) {
      console.error('Error setting password:', error);
      return { error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  const refreshProfile = async () => {
    if (tokenLinkAuth.isTokenLinkUser && tokenLinkAuth.profile) {
      // For TokenLink users, refresh from TokenLink auth
      const result = await tokenLinkAuth.updateProfile?.(tokenLinkAuth.profile);
      if (!result?.error && result?.data) {
        setProfile({
          id: result.data.id,
          email: result.data.email,
          full_name: result.data.full_name,
          username: result.data.username || null,
          role: result.data.role as UserRole,
          avatar_url: result.data.avatar_url || null,
          bio: result.data.bio || null,
          minecraft_username: result.data.minecraft_username || null,
        });
      }
      return result;
    }

    if (!user) return { error: new Error('Not authenticated') };
    
    // For regular Supabase users, refresh from database
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setProfile(data);
    }
    
    return { data, error };
  };

  // Function to manually refresh authentication state from localStorage
  const refreshAuthState = () => {
    const playerUuid = localStorage.getItem("player_uuid");
    const playerName = localStorage.getItem("player_name");
    const profileData = localStorage.getItem("profile");
    
    if (playerUuid && playerName) {
      console.log('useAuth: Manually refreshing TokenLink authentication state');
      
      const basicProfile = {
        id: localStorage.getItem("tokenlink_profile_id") || playerUuid,
        email: playerName + '@tokenlink.local',
        full_name: playerName,
        username: playerName,
        role: 'member' as UserRole,
        avatar_url: null,
        bio: null,
        minecraft_username: playerName,
        can_login_with_username: false,
      };
      
      setProfile(basicProfile);
      
      const tokenLinkUser = {
        id: basicProfile.id,
        email: basicProfile.email,
      } as User;
      
      setUser(tokenLinkUser);
      setLoading(false);
      return true;
    }
    
    return false;
  };

  return {
    user,
    profile,
    loading: loading || tokenLinkAuth.loading,
    signIn,
    signInWithUsername,
    signUp,
    signOut,
    updateProfile,
    setPassword,
    refreshProfile,
    refreshAuthState,
    isAuthenticated: !!user || (tokenLinkAuth.isTokenLinkUser && !!tokenLinkAuth.profile) || !!(localStorage.getItem("player_uuid") && localStorage.getItem("player_name")),
    userRole: profile?.role || 'member' as UserRole,
    isTokenLinkUser: tokenLinkAuth.isTokenLinkUser,
    playerUuid: tokenLinkAuth.playerUuid,
    playerName: tokenLinkAuth.playerName,
  };
};

export type { User };
