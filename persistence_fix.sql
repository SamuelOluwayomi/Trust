-- Add persistence columns to users table for blockchain state caching
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_balance NUMERIC DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_sbt_count INTEGER DEFAULT 0;

COMMENT ON COLUMN users.last_balance IS 'Cached wallet balance in HSK for UI persistence.';
COMMENT ON COLUMN users.last_sbt_count IS 'Cached SBT count for UI persistence.';
