-- Function to get unpaid loans for a farmer
CREATE OR REPLACE FUNCTION get_unpaid_loans(farmer_id_param UUID)
RETURNS TABLE (contract_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT lc.id
  FROM loan_contract lc
  JOIN loan_application la ON la.id = lc.loan_application_id
  JOIN loan_repayments lr ON lr.loan_contract_id = lc.id
  WHERE la.farmer_id = farmer_id_param 
    AND lr.date_paid IS NULL
    AND lc.status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Function to calculate total amount of unpaid loans
CREATE OR REPLACE FUNCTION get_total_unpaid_loan_amount(farmer_id_param UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_amount NUMERIC;
BEGIN
  SELECT COALESCE(SUM(lc.amount_disbursed), 0)
  INTO total_amount
  FROM loan_contract lc
  JOIN loan_application la ON la.id = lc.loan_application_id
  JOIN loan_repayments lr ON lr.loan_contract_id = lc.id
  WHERE la.farmer_id = farmer_id_param 
    AND lr.date_paid IS NULL
    AND lc.status = 'active';
  
  RETURN total_amount;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate loan duration in days
CREATE OR REPLACE FUNCTION get_loan_duration_days(farmer_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  min_created TIMESTAMP;
  max_due TIMESTAMP;
  duration_days INTEGER;
BEGIN
  -- Get the earliest contract creation date
  SELECT MIN(lc.created_at)
  INTO min_created
  FROM loan_contract lc
  JOIN loan_application la ON la.id = lc.loan_application_id
  WHERE la.farmer_id = farmer_id_param
    AND lc.status = 'active';
  
  -- Get the latest repayment due date
  SELECT MAX(lr.due_date)
  INTO max_due
  FROM loan_repayments lr
  JOIN loan_contract lc ON lr.loan_contract_id = lc.id
  JOIN loan_application la ON la.id = lc.loan_application_id
  WHERE la.farmer_id = farmer_id_param
    AND lr.date_paid IS NULL
    AND lc.status = 'active';
  
  -- Calculate duration in days
  IF min_created IS NOT NULL AND max_due IS NOT NULL THEN
    SELECT EXTRACT(DAY FROM (max_due - min_created))::INTEGER
    INTO duration_days;
  ELSE
    duration_days := 0;
  END IF;
  
  RETURN duration_days;
END;
$$ LANGUAGE plpgsql;
