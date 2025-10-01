
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  name: string;
  phone?: string;
  referral_code: string;
  parent_id?: string;
  is_active: boolean;
  kyc_status: string;
  total_investment: number;
  total_roi_earned: number;
  total_referral_earned: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, name: string, phone?: string, referralCode?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('AuthContext - Fetching profile for:', userId);
      
      // Use the get_user_profile function for better performance and type safety
      const { data: profileData, error: profileError } = await supabase
        .rpc('get_user_profile', { _user_id: userId });

      if (profileError) {
        console.error('Profile error:', profileError);
        // Fallback to direct query
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single();
        
        if (userProfile) {
          setProfile({
            id: userProfile.id,
            name: userProfile.name,
            phone: userProfile.phone,
            referral_code: userProfile.referral_code,
            parent_id: userProfile.parent_id,
            is_active: userProfile.is_active,
            kyc_status: userProfile.kyc_status,
            total_investment: userProfile.total_investment || 0,
            total_roi_earned: userProfile.total_roi_earned || 0,
            total_referral_earned: userProfile.total_referral_earned || 0
          });
          setIsAdmin(userRole?.role === 'admin' || userRole?.role === 'super_admin');
        }
        return;
      }

      if (profileData && profileData.length > 0) {
        const profile = profileData[0];
        console.log('AuthContext - Profile fetched:', profile.name);
        setProfile({
          id: profile.id,
          name: profile.name,
          phone: profile.phone,
          referral_code: profile.referral_code,
          parent_id: profile.parent_id,
          is_active: profile.is_active,
          kyc_status: profile.kyc_status,
          total_investment: profile.total_investment || 0,
          total_roi_earned: profile.total_roi_earned || 0,
          total_referral_earned: profile.total_referral_earned || 0
        });
        setIsAdmin(profile.role === 'admin' || profile.role === 'super_admin');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    console.log('AuthContext - Setting up auth listener');
    
    // Check for existing session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthContext - Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('AuthContext - Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid deadlock
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, phone?: string, referralCode?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            phone,
            referral_code: referralCode
          }
        }
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Clear all state
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      
      // Navigate to auth page
      window.location.href = '/auth';
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    profile,
    isAdmin,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
