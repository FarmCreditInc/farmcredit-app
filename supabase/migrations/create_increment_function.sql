-- Create a simple function to safely increment numeric values
CREATE OR REPLACE FUNCTION increment(x numeric, y numeric)
RETURNS numeric AS $$
BEGIN
  RETURN x + y;
END;
$$ LANGUAGE plpgsql;
