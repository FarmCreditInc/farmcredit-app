-- Function to get total disbursed amount for a farmer
CREATE OR REPLACE FUNCTION get_total_disbursed_amount(farmer_id UUID)
RETURNS NUMERIC AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(lc.amount_disbursed), 0)
    FROM loan_contract lc
    JOIN loan_application la ON lc.loan_application_id = la.id
    WHERE la.farmer_id = $1
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get total repaid amount for a farmer
CREATE OR REPLACE FUNCTION get_total_repaid_amount(farmer_id UUID)
RETURNS NUMERIC AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(lr.periodic_repayment_amount), 0)
    FROM loan_repayments lr
    JOIN loan_contract lc ON lr.loan_contract_id = lc.id
    JOIN loan_application la ON lc.loan_application_id = la.id
    WHERE la.farmer_id = $1
  );
END;
$$ LANGUAGE plpgsql;
