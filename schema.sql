-- SQL Schema for Trust Protocol (Supabase)

-- 1. Users Table (Stores identity and wallet linkage)
CREATE TABLE IF NOT EXISTS public.users (
    privy_id TEXT PRIMARY KEY,
    wallet_address TEXT UNIQUE,
    worldid_nullifier TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Loans Table (Stores metadata and persistent status of loans)
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    privy_id TEXT REFERENCES public.users(privy_id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    tier TEXT CHECK (tier IN ('Bronze', 'Silver', 'Gold')),
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Repaid', 'Defaulted')),
    amount_paid NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Transactions Table (Stores history of all actions)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    privy_id TEXT REFERENCES public.users(privy_id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('borrow', 'repay')),
    amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) - Optional but recommended
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Allow users to see and manage only their own data (assuming authenticated privy roles or public anon keys)
-- Create policies as needed for your specific Supabase setup
