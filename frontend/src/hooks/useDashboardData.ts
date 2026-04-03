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
    if (!authenticated || !user) return;
    
    try {
      setLoading(true);
      // Fetch user's loans
      const { data: loansData, error: loansError } = await supabase
        .from('loans')
        .select('*')
        .eq('privy_id', user.id)
        .order('created_at', { ascending: false });

      if (loansError) throw loansError;
      setLoans(loansData || []);

      // Fetch user's transactions 
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('privy_id', user.id)
        .order('created_at', { ascending: false });

      if (txError) throw txError;
      setTransactions(txData || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, authenticated]);

  return {
    loans,
    transactions,
    loading,
    refetch: fetchDashboardData
  };
}
