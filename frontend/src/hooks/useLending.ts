import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { supabase } from '@/lib/supabase';

export function useLending() {
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [isRepaying, setIsRepaying] = useState(false);

  const borrow = async (amount: number) => {
    if (!authenticated || !user || wallets.length === 0) {
      throw new Error("Wallet not connected");
    }

    setIsBorrowing(true);
    try {
      // Mock network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const tier = amount <= 500 ? 'Bronze' : amount <= 2000 ? 'Silver' : 'Gold';

      // Insert Loan into database
      const { error: loanError } = await supabase
        .from('loans')
        .insert({
          privy_id: user.id,
          amount,
          tier,
          status: 'Active',
          amount_paid: 0
        });
      
      if (loanError) throw loanError;

      // Insert transaction history
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          privy_id: user.id,
          type: 'borrow',
          amount
        });

      if (txError) throw txError;

      return { success: true };
    } catch (error) {
      console.error("Borrowing failed:", error);
      throw error;
    } finally {
      setIsBorrowing(false);
    }
  };

  const repay = async (amount: number, loanId: string) => {
    if (!authenticated || !user || wallets.length === 0) {
      throw new Error("Wallet not connected");
    }

    setIsRepaying(true);
    try {
      // Mock network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update Loan
      const { data: loan, error: fetchError } = await supabase
        .from('loans')
        .select('*')
        .eq('id', loanId)
        .single();
      
      if (fetchError) throw fetchError;

      const newAmountPaid = Number(loan.amount_paid) + amount;
      const status = newAmountPaid >= Number(loan.amount) ? 'Repaid' : 'Active';

      const { error: updateError } = await supabase
        .from('loans')
        .update({ amount_paid: newAmountPaid, status })
        .eq('id', loanId);

      if (updateError) throw updateError;

      // Insert transaction history
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          privy_id: user.id,
          type: 'repay',
          amount
        });

      if (txError) throw txError;

      return { success: true };
    } catch (error) {
      console.error("Repaying failed:", error);
      throw error;
    } finally {
      setIsRepaying(false);
    }
  };

  return {
    borrow,
    repay,
    isBorrowing,
    isRepaying
  };
}
