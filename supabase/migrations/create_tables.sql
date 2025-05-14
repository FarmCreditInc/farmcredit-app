-- Create the pending_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS pending_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role TEXT NOT NULL CHECK (role IN ('farmer', 'lender', 'admin')),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT,
  gender TEXT,
  age INTEGER,
  phone TEXT,
  state TEXT,
  lga TEXT,
  education_level TEXT,
  farming_experience INTEGER,
  farm_size NUMERIC,
  crop_types TEXT,
  livestock_type TEXT,
  is_coop_member BOOLEAN,
  uses_fertilizer BOOLEAN,
  uses_machinery BOOLEAN,
  uses_irrigation BOOLEAN,
  id_document_url TEXT,
  organization_name TEXT,
  contact_person_name TEXT,
  organization_type TEXT,
  license_number TEXT,
  verification_document_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Enable Row Level Security
ALTER TABLE pending_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to see all pending users
CREATE POLICY "Admins can see all pending users"
ON pending_users
FOR SELECT
USING (auth.role() = 'service_role' OR auth.role() = 'authenticated' AND EXISTS (
  SELECT 1 FROM admins WHERE user_id = auth.uid()
));

-- Create policy to allow anonymous users to insert into pending_users
CREATE POLICY "Allow anonymous insert to pending_users"
ON pending_users
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create farmers table
CREATE TABLE IF NOT EXISTS farmers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  gender TEXT,
  age INTEGER,
  phone TEXT,
  state TEXT,
  lga TEXT,
  education_level TEXT,
  farming_experience INTEGER,
  farm_size NUMERIC,
  crop_types TEXT,
  livestock_type TEXT,
  is_coop_member BOOLEAN,
  uses_fertilizer BOOLEAN,
  uses_machinery BOOLEAN,
  uses_irrigation BOOLEAN,
  id_document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow farmers to see their own data
CREATE POLICY "Farmers can see their own data"
ON farmers
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy to allow farmers to update their own data
CREATE POLICY "Farmers can update their own data"
ON farmers
FOR UPDATE
USING (auth.uid() = user_id);

-- Create lenders table
CREATE TABLE IF NOT EXISTS lenders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  contact_person_name TEXT,
  phone TEXT,
  organization_type TEXT,
  license_number TEXT,
  verification_document_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE lenders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow lenders to see their own data
CREATE POLICY "Lenders can see their own data"
ON lenders
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy to allow lenders to update their own data
CREATE POLICY "Lenders can update their own data"
ON lenders
FOR UPDATE
USING (auth.uid() = user_id);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to see all admin data
CREATE POLICY "Admins can see all admin data"
ON admins
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM admins WHERE user_id = auth.uid()
));

-- Create storage buckets if they don't exist
-- Note: This requires superuser privileges and might need to be done manually
-- in the Supabase dashboard if you don't have superuser access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'anon'
  ) THEN
    CREATE ROLE anon;
  END IF;
END
$$;

-- Create storage buckets for documents
-- Note: This is a placeholder and would need to be done through the Supabase dashboard
-- or using the Supabase admin API
