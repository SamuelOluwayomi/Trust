import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from '@/lib/supabase';

export interface Loan {
  id: string;
  privy_id: string;
  amount: number;
  tier: string;
  status: 'Active' | 'Repaid';
  amount_paid: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  privy_id: string;
  type: 'borrow' | 'repay';
  amount: number;
  created_at: string;
}

export function useDashboardData() {
  const { user, authenticated } = usePrivy();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!authenticated || !user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      // FECTH RECENT LOANS FROM DB
      const { data: loansData, error: loansError } = await supabase
        .from('loans')
        .select('*')
        .eq('privy_id', user.id)
        .order('created_at', { ascending: false });

      if (!loansError && loansData) {
        setLoans(loansData);
      }

      // FETCH RECENT TRANSACTIONS FROM DB (Preferred for dashboard speed)
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('privy_id', user.id)
        .order('created_at', { ascending: false });

      if (!txError && txData) {
        setTransactions(txData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !authenticated) {
      setLoading(false);
      return;
    }
    
    // We prioritize DB data for the main dashboard to avoid 504 RPC timeouts.
    // The "Live Balance" is handled by useUserStats separately.
    fetchDashboardData();
  }, [user, authenticated]);

  return {
    loans,
    transactions,
    loading,
    refetch: fetchDashboardData
  };
}
