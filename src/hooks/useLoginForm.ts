import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';
import { findMemberByNumber, loginOrSignupMember } from '@/services/auth/memberAuth';
import { supabase } from "@/integrations/supabase/client";

export const useLoginForm = () => {
  const [memberNumber, setMemberNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First clear any existing session
      await supabase.auth.signOut();
      
      const maxRetries = 3;
      let currentTry = 0;
      const formattedMemberNumber = memberNumber.trim().toUpperCase();

      while (currentTry < maxRetries) {
        try {
          // First verify member exists
          const member = await findMemberByNumber(formattedMemberNumber);
          
          // Then attempt login/signup
          const authData = await loginOrSignupMember(formattedMemberNumber);

          // If we have a user and they're new, update their member record
          if (authData.user && member && !member.auth_user_id) {
            const { error: updateError } = await supabase
              .from('members')
              .update({ auth_user_id: authData.user.id })
              .eq('id', member.id);

            if (updateError) {
              console.error('Error updating member with auth_user_id:', updateError);
              throw updateError;
            }
          }

          // Verify session is established
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            throw new Error('Failed to establish session');
          }

          await queryClient.invalidateQueries();
          
          toast({
            title: "Login successful",
            description: "Welcome back!",
          });

          navigate('/');
          return;

        } catch (error: any) {
          console.error(`Login attempt ${currentTry + 1} failed:`, error);
          currentTry++;
          
          if (currentTry === maxRetries) {
            await supabase.auth.signOut();
            setError(error.message || "Please try again later. If the problem persists, contact support.");
            
            toast({
              title: "Login failed",
              description: error.message || "Please try again later. If the problem persists, contact support.",
              variant: "destructive",
            });
          } else {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, currentTry) * 1000));
            console.log(`Retrying login... Attempt ${currentTry + 1} of ${maxRetries}`);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    memberNumber,
    setMemberNumber,
    loading,
    error,
    handleLogin
  };
};