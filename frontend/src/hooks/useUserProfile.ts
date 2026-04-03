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
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('privy_id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') { // Not "No rows returned"
        throw error;
      }
      
      setProfile(data || null);
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
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert({
          privy_id: user.id,
          wallet_address: wallets[0]?.address || null,
          worldid_nullifier: nullifier,
        }, { onConflict: 'privy_id' })
        .select()
        .single();
        
      if (userError) throw userError;
      setProfile(userData);
    }
  };
}
