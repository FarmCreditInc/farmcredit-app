-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lender_id UUID NOT NULL,
  balance NUMERIC NOT NULL DEFAULT 0,
  locked_balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID REFERENCES wallets(id),
  type TEXT CHECK (type IN ('credit', 'debit', 'fee', 'withdrawal', 'loan_funding')),
  amount NUMERIC NOT NULL,
  purpose TEXT,
  reference TEXT,
  status TEXT DEFAULT 'successful',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID REFERENCES wallets(id),
  amount NUMERIC NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  transaction_id UUID REFERENCES transactions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Lender can only see their own wallet
CREATE POLICY wallet_select_policy ON wallets
  FOR SELECT USING (lender_id = auth.uid());

-- Lender can only see their own transactions
CREATE POLICY transactions_select_policy ON transactions
  FOR SELECT USING (wallet_id IN (SELECT id FROM wallets WHERE lender_id = auth.uid()));

-- Lender can only see their own withdrawals
CREATE POLICY withdrawals_select_policy ON withdrawals
  FOR SELECT USING (wallet_id IN (SELECT id FROM wallets WHERE lender_id = auth.uid()));

-- Create function to initialize wallet for new lenders
CREATE OR REPLACE FUNCTION initialize_lender_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (lender_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to initialize wallet for new lenders
CREATE TRIGGER create_wallet_for_new_lender
AFTER INSERT ON users
FOR EACH ROW
WHEN (NEW.role = 'lender')
EXECUTE FUNCTION initialize_lender_wallet();
