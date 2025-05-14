-- Add admin_notes and processed_at columns to withdrawals table
ALTER TABLE IF EXISTS public.withdrawals
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

-- Create a function to handle withdrawal status changes
CREATE OR REPLACE FUNCTION public.handle_withdrawal_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the updated_at timestamp
  NEW.updated_at = NOW();
  
  -- If status changed to successful, set processed_at if not already set
  IF NEW.status = 'successful' AND NEW.processed_at IS NULL THEN
    NEW.processed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to run the function before update
DROP TRIGGER IF EXISTS withdrawal_status_change_trigger ON public.withdrawals;
CREATE TRIGGER withdrawal_status_change_trigger
BEFORE UPDATE ON public.withdrawals
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.handle_withdrawal_status_change();
