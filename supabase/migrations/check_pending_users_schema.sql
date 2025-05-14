-- This is a query to check the schema of the pending_users table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pending_users';
