-- Create farmers table
CREATE TABLE IF NOT EXISTS public.farmers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
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
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lenders table
CREATE TABLE IF NOT EXISTS public.lenders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    organization_name TEXT NOT NULL,
    contact_person_name TEXT NOT NULL,
    phone TEXT,
    organization_type TEXT,
    license_number TEXT,
    verification_document_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admins table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a default admin user (password: admin123)
-- In production, use a secure password and change it immediately
INSERT INTO public.admins (email, password_hash, full_name)
VALUES ('admin@example.com', '$2a$10$rDkPvOQxBPX6YZXpAI/Nw.LPi9QGv/7/g5nHnvJ5yrlQwQ9cfALfq', 'Admin User')
ON CONFLICT (email) DO NOTHING;

-- Set up RLS policies
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Farmers table policies
CREATE POLICY "Admins can read all farmers"
ON public.farmers FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.id::text = auth.uid()
));

CREATE POLICY "Farmers can read their own data"
ON public.farmers FOR SELECT
TO authenticated
USING (id::text = auth.uid());

-- Lenders table policies
CREATE POLICY "Admins can read all lenders"
ON public.lenders FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.id::text = auth.uid()
));

CREATE POLICY "Lenders can read their own data"
ON public.lenders FOR SELECT
TO authenticated
USING (id::text = auth.uid());

-- Admins table policies
CREATE POLICY "Admins can read their own data"
ON public.admins FOR SELECT
TO authenticated
USING (id::text = auth.uid());
