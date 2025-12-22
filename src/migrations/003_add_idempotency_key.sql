ALTER TABLE stock_transfers
ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;
