import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from '@/lib/supabase';
import { ethers } from "ethers";

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
      // Fetch user's loans via Supabase (as a secondary source)
      const { data: loansData, error: loansError } = await supabase
        .from('loans')
        .select('*')
        .eq('privy_id', user.id)
        .order('created_at', { ascending: false });

      if (loansError) throw loansError;
      setLoans(loansData || []);
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
    
    const fetchHistory = async () => {
      try {
        const { getLoanManagerContract } = await import('@/lib/contracts');
        const contract = getLoanManagerContract();
        const address = user.wallet?.address;
        
        if (!address) {
          setLoading(false);
          return;
        }

        // Fetch events directly from the chain for TRULY LIVE status
        const [appliedEvents, repaidEvents] = await Promise.all([
          contract.queryFilter(contract.filters.LoanApplied(address)),
          contract.queryFilter(contract.filters.LoanRepaid(address)),
        ]);

        const history: Transaction[] = [
          ...appliedEvents.map((ev: any) => ({
            id: ev.transactionHash,
            privy_id: user.id,
            type: 'borrow' as const,
            amount: Number(ethers.formatEther(ev.args[1])),
            created_at: new Date().toISOString()
          })),
          ...repaidEvents.map((ev: any) => ({
            id: ev.transactionHash,
            privy_id: user.id,
            type: 'repay' as const,
            amount: Number(ethers.formatEther(ev.args[1])),
            created_at: new Date().toISOString()
          }))
        ].sort((a, b) => b.created_at.localeCompare(a.created_at));

        setTransactions(history);
      } catch (err) {
        console.error("Live history fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    fetchDashboardData();
  }, [user, authenticated]);

  return {
    loans,
    transactions,
    loading,
    refetch: fetchDashboardData
  };
}
