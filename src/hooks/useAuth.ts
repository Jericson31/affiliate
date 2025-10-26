import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { sessionManager } from '@/lib/auth/sessionManager';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: 'admin' | 'affiliate';
  avatar_url: string | null;
  member_since: string;
  updated_at: string;
  partnership_code?: string | null;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isAffiliate: boolean;
  accessToken: string | null;
}

// Create a singleton Supabase client outside the hook
const supabase = createClient();

export const useAuth = () => {
  console.log('🔍 useAuth: Hook initializing');
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    isAdmin: false,
    isAffiliate: false,
    accessToken: null,
  });

  console.log('🔍 useAuth: Using singleton Supabase client');

  useEffect(() => {
    console.log('🔍 useAuth: useEffect running - getting initial session'); // Debug Auth 3
    let isMounted = true;
    let timeoutCleared = false;

    // Add timeout fallback to prevent loading from being stuck
    const loadingTimeout = setTimeout(() => {
      if (!isMounted || timeoutCleared) return;
      console.warn('⚠️ useAuth: Loading timeout reached after 8 seconds - forcing loading to false');
      setAuthState(prev => {
        if (prev.loading) {
          console.error('⚠️ useAuth: Authentication timeout - loading was still true after 8 seconds');
          console.error('⚠️ This may indicate: 1) Expired/invalid Supabase token, 2) Network issues, 3) Database connectivity problems');
          return { ...prev, loading: false, user: null, profile: null };
        }
        return prev;
      });
    }, 8000); // 8 second timeout with better recovery

    // Get initial session
    const getInitialSession = async () => {
      console.log('🔍 useAuth: Calling supabase.auth.getSession()'); // Debug Auth 4
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!isMounted) return;

        console.log('🔍 useAuth: Raw getSession response - session:', session, 'error:', error);
        if (error) {
          console.error('❌ useAuth: Error getting session:', error);

          // Check for specific token/auth errors
          if (error.message?.includes('JWT') || error.message?.includes('token') || error.message?.includes('expired')) {
            console.error('❌ useAuth: JWT/Token error detected - your Supabase anon key may be expired or invalid');
            console.error('❌ Please check your .env file and get a new VITE_SUPABASE_ANON_KEY from Supabase dashboard');
          }

          console.log('🔍 useAuth: Setting loading to false due to session error');
          setAuthState(prev => ({ ...prev, loading: false }));
          timeoutCleared = true;
          clearTimeout(loadingTimeout);
          return;
        }
        console.log('🔍 useAuth: getSession response:', session ? 'Session found' : 'No session'); // Debug Auth 5
        console.log('🔍 useAuth: Session details:', session);

        if (session?.user) {
          console.log('🔍 useAuth: User found in session, fetching profile for user:', session.user.id);
          // Set user, access token, and loading to false IMMEDIATELY
          if (isMounted && !timeoutCleared) {
            setAuthState(prev => ({
              ...prev,
              user: session.user,
              accessToken: session.access_token,
              loading: false
            }));
            timeoutCleared = true;
            clearTimeout(loadingTimeout);
          }
          // Fetch profile without blocking - errors won't prevent dashboard access
          await fetchUserProfile(session.user, session.access_token, isMounted, timeoutCleared);
        } else {
          console.log('🔍 useAuth: No user in session, setting loading to false');
          if (isMounted && !timeoutCleared) {
            setAuthState(prev => ({ ...prev, loading: false }));
            timeoutCleared = true;
            clearTimeout(loadingTimeout);
          }
        }
      } catch (e) {
        console.error('❌ useAuth: Caught exception during getSession:', e);
        console.log('🔍 useAuth: Setting loading to false due to exception');
        if (isMounted && !timeoutCleared) {
          setAuthState(prev => ({ ...prev, loading: false }));
          timeoutCleared = true;
          clearTimeout(loadingTimeout);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        (async () => {
          if (!isMounted || timeoutCleared) return;

          console.log('🔍 useAuth: Auth state change event:', event, 'session:', session ? 'Session exists' : 'No session');
          console.log('🔍 useAuth: Auth state change - full session object:', session);
          if (session?.user) {
            console.log('🔍 useAuth: Auth change - fetching profile for user:', session.user.id);
            // Set user and access token IMMEDIATELY when session changes
            if (isMounted && !timeoutCleared) {
              setAuthState(prev => ({
                ...prev,
                user: session.user,
                accessToken: session.access_token,
                loading: false
              }));
            }
            await fetchUserProfile(session.user, session.access_token, isMounted, false);
          } else {
            console.log('🔍 useAuth: Auth change - no user, clearing state');
            if (isMounted && !timeoutCleared) {
              setAuthState({
                user: null,
                profile: null,
                loading: false,
                isAdmin: false,
                isAffiliate: false,
                accessToken: null,
              });
            }
          }
        })();
      }
    );

    sessionManager.startPeriodicCheck(() => {
      console.warn('⚠️ Session expired or invalid, signing out user');
      if (isMounted) {
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          isAdmin: false,
          isAffiliate: false,
          accessToken: null,
        });
        window.history.pushState({}, '', '/auth');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    });

    return () => {
      isMounted = false;
      timeoutCleared = true;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
      sessionManager.stopPeriodicCheck();
    };
  }, []);

  const fetchUserProfile = async (user: User, accessToken: string, isMounted: boolean = true, timeoutCleared: boolean = false) => {
    console.log('🔍 fetchUserProfile: Starting profile fetch for user:', user.id);
    console.log('🔍 fetchUserProfile: Access token provided:', !!accessToken);
    try {
      console.log('🔍 fetchUserProfile: Step 1 - Attempting to query user_profiles table for user_id:', user.id);
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('🔍 fetchUserProfile: Step 2 - Supabase query for user_profiles completed.');
      console.log('🔍 fetchUserProfile: Profile data received:', profile);
      console.log('🔍 fetchUserProfile: Database query error:', error);

      if (error) {
        console.error('❌ fetchUserProfile: Error fetching user profile:', error);

        // Check for specific RLS or permission errors
        if (error.code === 'PGRST301' || error.message?.includes('row-level security') || error.message?.includes('permission denied')) {
          console.error('❌ fetchUserProfile: RLS/Permission error - user may not have access to their profile yet');
        }

        console.log('🔍 fetchUserProfile: Setting authenticated state without profile due to error');
        // CRITICAL: User is authenticated even if profile fetch fails
        // This allows them to access the dashboard and create their profile
        if (isMounted && !timeoutCleared) {
          setAuthState({
            user,
            profile: null,
            loading: false,
            isAdmin: false,
            isAffiliate: false,
            accessToken,
          });
        }
        return;
      }

      // Fetch partnership code for any authenticated user
      let enhancedProfile = profile;
      if (profile) {
        console.log('🔍 fetchUserProfile: Step 3 - Profile exists, fetching affiliate data');
        try {
          console.log('🔍 fetchUserProfile: Step 3a - Attempting to query affiliates table for user_id:', user.id);
          const { data: affiliateData, error: affiliateError } = await supabase
            .from('affiliates')
            .select('partnership_code')
            .eq('user_id', user.id)
            .maybeSingle();
          console.log('🔍 fetchUserProfile: Step 3b - Supabase query for affiliates completed.');

          if (!affiliateError && affiliateData) {
            console.log('🔍 fetchUserProfile: Affiliate data found:', affiliateData);
            enhancedProfile = {
              ...profile,
              partnership_code: affiliateData.partnership_code
            };
          } else if (affiliateError) {
            console.error('❌ fetchUserProfile: Error fetching affiliate data:', affiliateError);
          } else {
            console.log('🔍 fetchUserProfile: No affiliate data found');
          }
        } catch (affiliateErr) {
          console.error('❌ fetchUserProfile: Exception fetching affiliate data:', affiliateErr);
          // Continue with profile without partnership_code
        }
      } else {
        console.log('🔍 fetchUserProfile: Step 4 - No profile found in user_profiles table');
        console.log('🔍 fetchUserProfile: User is authenticated but needs to create profile');
        // CRITICAL: User is authenticated even without a profile
        // Allow them to access the dashboard where they can create their profile
        if (isMounted && !timeoutCleared) {
          setAuthState({
            user,
            profile: null,
            loading: false,
            isAdmin: false,
            isAffiliate: false,
            accessToken,
          });
        }
        console.log('🔍 fetchUserProfile: Set authenticated state without profile');
        return;
      }

      console.log('🔍 fetchUserProfile: Step 5 - Final enhanced profile before setState:', enhancedProfile);
      console.log('🔍 fetchUserProfile: Step 6 - Setting final auth state:', {
        user: !!user,
        profile: !!enhancedProfile,
        loading: false,
        isAdmin: enhancedProfile?.role === 'admin',
        isAffiliate: enhancedProfile?.role === 'affiliate'
      });

      if (isMounted && !timeoutCleared) {
        setAuthState({
          user,
          profile: enhancedProfile,
          loading: false,
          isAdmin: enhancedProfile?.role === 'admin',
          isAffiliate: enhancedProfile?.role === 'affiliate',
          accessToken, // Use the access token passed to function
        });
        console.log('🔍 fetchUserProfile: setAuthState called with new profile data');
      }
    } catch (error) {
      console.error('❌ fetchUserProfile: Exception in fetchUserProfile:', error);
      console.log('🔍 fetchUserProfile: Setting loading to false due to exception');
      if (isMounted && !timeoutCleared) {
        setAuthState({
          user,
          profile: null,
          loading: false,
          isAdmin: false,
          isAffiliate: false,
          accessToken, // Preserve access token even on exception
        });
      }
    }
    console.log('🔍 fetchUserProfile: fetchUserProfile completed');
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      return { error };
    }
    return { error: null };
  };

  const updateReferralCode = async (newCode: string) => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      throw new Error(`Session error: ${sessionError.message}`);
    }

    if (!session?.access_token) {
      throw new Error('No active session found. Please try logging in again.');
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-referral-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        new_partnership_code: newCode
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update referral code');
    }

    return result;
  };

  const updateProfile = async (userId: string, firstName: string, lastName: string, phone: string) => {
    console.log('🔧 updateProfile: Function called with:', { userId, firstName, lastName, phone });

    // Log current auth state
    console.log('🔧 updateProfile: Current auth state:', {
      hasUser: !!authState.user,
      hasProfile: !!authState.profile,
      userRole: authState.profile?.role,
      isAffiliate: authState.isAffiliate
    });

    console.log('🔧 updateProfile: About to call Supabase update...');
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    console.log('🔧 updateProfile: Supabase update response - data:', data);
    console.log('🔧 updateProfile: Supabase update response - error:', error);
    
    // Log the exact SQL query that would be executed (for debugging)
    console.log('🔧 updateProfile: Update query details:', {
      table: 'user_profiles',
      updateData: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        updated_at: new Date().toISOString()
      },
      whereClause: `user_id = ${userId}`
    });

    if (error) {
      console.error('🔧 updateProfile: Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Handle specific error when no profile record exists
      if (error.code === 'PGRST116' || error.message.includes('Cannot coerce the result to a single JSON object')) {
        throw new Error('Your user profile record is missing. Please contact support or try creating your affiliate record first.');
      }
      
      throw new Error(error.message || 'Failed to update profile');
    }

    // Check if no data was returned (no matching record found)
    if (!data) {
      throw new Error('No user profile found to update. Please contact support or try creating your affiliate record first.');
    }

    console.log('🔧 updateProfile: Update successful, about to refetch profile...');
    // Refetch the user profile to update the UI
    if (authState.user && authState.accessToken) {
      console.log('🔧 updateProfile: Calling fetchUserProfile with user:', authState.user.id);
      await fetchUserProfile(authState.user, authState.accessToken);
      console.log('🔧 updateProfile: fetchUserProfile completed');
    }

    return data;
  };

  const createAffiliateRecord = async () => {
    console.log('🔧 createAffiliateRecord: Function called');

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    console.log('🔧 createAffiliateRecord: Fresh session fetch:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasAccessToken: !!session?.access_token,
      sessionError: sessionError?.message
    });

    if (sessionError) {
      throw new Error(`Session error: ${sessionError.message}`);
    }

    if (!session?.user || !session?.access_token) {
      throw new Error('No authenticated session found. Please try logging in again.');
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user-profile-and-affiliate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        user_id: session.user.id,
        email: session.user.email
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create affiliate record');
    }

    return result;
  };
  return {
    ...authState,
    signOut,
    updateReferralCode,
    updateProfile,
    createAffiliateRecord,
    refetch: async () => {
      if (authState.user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          await fetchUserProfile(authState.user, session.access_token);
        }
      }
    },
  };
};