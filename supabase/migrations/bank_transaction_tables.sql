-- Check if payment_details table exists, if not create it
CREATE TABLE IF NOT EXISTS public.payment_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES farmers(id),
    bank_account_number TEXT,
    bank_name TEXT,
    bank_account_name TEXT,
    bvn TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check if transaction_history table exists, if not create it
CREATE TABLE IF NOT EXISTS public.transaction_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES farmers(id),
    transaction_data JSONB,
    bank_account_number TEXT,
    extracted_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_details_farmer_id ON payment_details(farmer_id);
CREATE INDEX IF NOT EXISTS idx_transaction_history_farmer_id ON transaction_history(farmer_id);
