-- Create notification_views table to track which notifications have been viewed by which users
CREATE TABLE IF NOT EXISTS notification_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  lender_id UUID REFERENCES lenders(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT true,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure either farmer_id or lender_id is provided, but not both
  CONSTRAINT either_farmer_or_lender CHECK (
    (farmer_id IS NOT NULL AND lender_id IS NULL) OR
    (farmer_id IS NULL AND lender_id IS NOT NULL)
  )
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notification_views_notification_id ON notification_views(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_views_farmer_id ON notification_views(farmer_id);
CREATE INDEX IF NOT EXISTS idx_notification_views_lender_id ON notification_views(lender_id);

-- Add RLS policies
ALTER TABLE notification_views ENABLE ROW LEVEL SECURITY;

-- Farmers can only see their own notification views
CREATE POLICY notification_views_farmer_select ON notification_views
  FOR SELECT USING (farmer_id = auth.uid());

-- Lenders can only see their own notification views
CREATE POLICY notification_views_lender_select ON notification_views
  FOR SELECT USING (lender_id = auth.uid());

-- Farmers can only insert their own notification views
CREATE POLICY notification_views_farmer_insert ON notification_views
  FOR INSERT WITH CHECK (farmer_id = auth.uid());

-- Lenders can only insert their own notification views
CREATE POLICY notification_views_lender_insert ON notification_views
  FOR INSERT WITH CHECK (lender_id = auth.uid());
