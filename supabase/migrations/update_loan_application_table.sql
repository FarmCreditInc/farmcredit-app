-- Add new columns to loan_application table
ALTER TABLE public.loan_application 
ADD COLUMN IF NOT EXISTS loan_duration_days INTEGER,
ADD COLUMN IF NOT EXISTS interest_rate NUMERIC,
ADD COLUMN IF NOT EXISTS estimated_total_repayment NUMERIC;
