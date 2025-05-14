-- Create support_tickets table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES farmers(id),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    attachment_url TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    admin_response TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Farmers can view their own tickets
CREATE POLICY "Farmers can view their own tickets"
ON public.support_tickets
FOR SELECT
TO authenticated
USING (farmer_id = auth.uid());

-- Farmers can create tickets
CREATE POLICY "Farmers can create tickets"
ON public.support_tickets
FOR INSERT
TO authenticated
WITH CHECK (farmer_id = auth.uid());

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
ON public.support_tickets
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admins
        WHERE admins.id = auth.uid()
    )
);

-- Admins can update tickets
CREATE POLICY "Admins can update tickets"
ON public.support_tickets
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admins
        WHERE admins.id = auth.uid()
    )
);
