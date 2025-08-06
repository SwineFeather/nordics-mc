
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { UserRole } from '@/types/wiki';
import { useTokenLinkAuth } from './useTokenLinkAuth';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  bio?: string | null;
  minecraft_username?: string | null;
  anonymous_mode?: boolean | null;
  silent_join_leave?: boolean | null;
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
      
      // Create user-like object for TokenLink users
      const tokenLinkUser = {
        id: tokenLinkAuth.profile.id,
        email: tokenLinkAuth.profile.email,
      } as User;
      
      setProfile({
        id: tokenLinkAuth.profile.id,
        email: tokenLinkAuth.profile.email,
        full_name: tokenLinkAuth.profile.full_name,
        role: tokenLinkAuth.profile.role as UserRole,
        avatar_url: tokenLinkAuth.profile.avatar_url || null,
        bio: tokenLinkAuth.profile.bio || null,
        minecraft_username: tokenLinkAuth.profile.minecraft_username || null,
      });
      setUser(tokenLinkUser);
      
      // Try to establish a proper Supabase session for TokenLink users
      tryEstablishSupabaseSession(tokenLinkAuth.profile);
      
      setLoading(false);
      return;
    }
    
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

  return {
    user,
    profile,
    loading: loading || tokenLinkAuth.loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!user || tokenLinkAuth.isTokenLinkUser,
    userRole: profile?.role || 'member' as UserRole,
    isTokenLinkUser: tokenLinkAuth.isTokenLinkUser,
    playerUuid: tokenLinkAuth.playerUuid,
    playerName: tokenLinkAuth.playerName,
  };
};

export type { User };
