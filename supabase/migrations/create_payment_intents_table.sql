-- Create payment_intents table if it doesn't exist
CREATE OR REPLACE FUNCTION create_payment_intents_table()
RETURNS void AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'payment_intents'
  ) THEN
    -- Create the table
    CREATE TABLE public.payment_intents (
      id UUID PRIMARY KEY,
      reference TEXT NOT NULL,
      contract_id UUID NOT NULL,
      farmer_id UUID NOT NULL,
      lender_id UUID NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      penalty DECIMAL(10, 2) DEFAULT 0,
      total_amount DECIMAL(10, 2) NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add indexes
    CREATE INDEX idx_payment_intents_reference ON public.payment_intents(reference);
    CREATE INDEX idx_payment_intents_contract_id ON public.payment_intents(contract_id);
    CREATE INDEX idx_payment_intents_farmer_id ON public.payment_intents(farmer_id);
    CREATE INDEX idx_payment_intents_lender_id ON public.payment_intents(lender_id);
    CREATE INDEX idx_payment_intents_status ON public.payment_intents(status);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_payment_intents_table();
