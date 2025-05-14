-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous insert to pending_users" ON pending_users;

-- Create a policy to allow anonymous inserts to pending_users
CREATE POLICY "Allow anonymous insert to pending_users"
ON pending_users
FOR INSERT
TO anon
WITH CHECK (true);
