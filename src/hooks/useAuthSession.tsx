import { useState, useEffect } from "react";
import { Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";

export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleAuthError = async (error: AuthError | Error) => {
    console.error('Auth error:', error);
    
    // Get error message based on error type
    const errorMessage = 'message' in error ? error.message : 
                        'error_description' in error ? (error as any).error_description :
                        'An unknown error occurred';
    
    if (errorMessage?.includes('Failed to fetch') || 
        errorMessage?.includes('session_not_found') || 
        errorMessage?.includes('JWT expired') ||
        errorMessage?.includes('Invalid Refresh Token') ||
        errorMessage?.includes('refresh_token_not_found')) {
      console.log('Session error detected, cleaning up...');
      
      // Clear session state
      setSession(null);
      
      // Clear queries and local storage
      await queryClient.resetQueries();
      localStorage.clear();
      
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error('Error during sign out:', signOutError);
      }
      
      toast({
        title: "Session expired",
        description: "Please sign in again",
        variant: "destructive",
      });
    }
    
    // Always ensure loading is set to false after error handling
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    const initializeSession = async () => {
      try {
        console.log('Checking authentication status...');
        setLoading(true);
        
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted) {
          if (currentSession?.user) {
            console.log('Active session found for user:', currentSession.user.id);
            setSession(currentSession);
          } else {
            console.log('No active session found');
            setSession(null);
          }
        }
      } catch (error: any) {
        if (mounted) {
          await handleAuthError(error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initialize session
    initializeSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', event, currentSession?.user?.id);
      setLoading(true);
      
      try {
        switch (event) {
          case 'SIGNED_OUT':
            console.log('User signed out, clearing session and queries');
            setSession(null);
            queryClient.resetQueries();
            localStorage.clear();
            break;
            
          case 'SIGNED_IN':
            console.log('Setting session after', event);
            setSession(currentSession);
            queryClient.resetQueries();
            break;
            
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed, updating session');
            setSession(currentSession);
            break;
            
          case 'USER_UPDATED':
            console.log('User updated, verifying session');
            const { data: { session: updatedSession }, error } = await supabase.auth.getSession();
            if (error) throw error;
            setSession(updatedSession);
            break;
        }
      } catch (error: any) {
        await handleAuthError(error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient, toast]);

  return { session, loading };
};