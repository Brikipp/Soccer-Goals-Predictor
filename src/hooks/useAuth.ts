// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface UseAuthResult {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

/**
 * Custom hook to manage authentication
 */
export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        // Create user profile if doesn't exist
        if (session?.user) {
          await createUserProfile(session.user);
        }
      } catch (error) {
        console.error('Error loading user session:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        
        // Create user profile on sign up
        if (session?.user) {
          await createUserProfile(session.user);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Create user profile in database if it doesn't exist
   */
  const createUserProfile = async (authUser: User) => {
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: authUser.id,
          email: authUser.email!,
        }, {
          onConflict: 'id',
          ignoreDuplicates: true,
        });

      if (error && error.code !== '23505') { // Ignore unique violation
        console.error('Error creating user profile:', error);
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
    }
  };

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      setUser(data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign in failed',
      };
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Note: Email confirmation may be required
      return { 
        success: true, 
        error: data.user?.identities?.length === 0 
          ? 'This email is already registered. Please sign in.' 
          : undefined 
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign up failed',
      };
    }
  };

  /**
   * Sign out current user
   */
  const signOut = async () => {
    console.log('signOut function called');
    
    // Clear user state immediately
    setUser(null);
    
    // Manually clear Supabase session from localStorage
    console.log('Clearing localStorage');
    const storageKey = `sb-${import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`;
    localStorage.removeItem(storageKey);
    
    // Clear all supabase-related items just to be safe
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') && key.includes('auth')) {
        console.log('Removing key:', key);
        localStorage.removeItem(key);
      }
    });
    
    console.log('Local session cleared');
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}