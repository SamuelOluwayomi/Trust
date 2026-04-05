import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  wallet_address: string | null;
  privy_id: string | null;
  worldid_nullifier: string | null;
  created_at: string;
}

export function useUserProfile() {
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = async () => {
    if (!authenticated || !user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Use .limit(1) instead of .single() to avoid 406 errors when user doesn't exist
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('privy_id', user.id)
        .limit(1);
        
      if (error) throw error;
      
      setProfile(data && data.length > 0 ? data[0] : null);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user, authenticated]);

  const isVerified = Boolean(profile?.worldid_nullifier);

  return {
    profile,
    loading,
    error,
    isVerified,
    refetch: fetchProfile,
    verify: async (nullifier: string) => {
      if (!user) return;
      
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .upsert({
            privy_id: user.id,
            wallet_address: user.wallet?.address || wallets[0]?.address || null,
            worldid_nullifier: nullifier,
          }, { onConflict: 'privy_id' })
          .select();
          
        if (userError) {
          // Handle 409 Conflict / Unique Violation (Error code 23505 in Postgres)
          if (userError.code === '23505') {
            throw new Error('This World ID is already linked to another account.');
          }
          throw userError;
        }
        
        const finalProfile = userData && userData.length > 0 ? userData[0] : null;
        setProfile(finalProfile);
        return finalProfile;
      } catch (err: any) {
        console.error('Verification save failed:', err);
        throw err;
      }
    }
  };
}
