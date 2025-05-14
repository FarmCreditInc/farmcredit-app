-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token TEXT NOT NULL UNIQUE,
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  lender_id UUID REFERENCES lenders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_type_check CHECK (
    (farmer_id IS NOT NULL AND lender_id IS NULL) OR
    (farmer_id IS NULL AND lender_id IS NOT NULL) OR
    (farmer_id IS NULL AND lender_id IS NULL)
  )
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(chat_session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_farmer_id ON chat_sessions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_lender_id ON chat_sessions(lender_id);

-- Add RLS policies
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for chat_sessions
CREATE POLICY "Farmers can view their own chat sessions"
  ON chat_sessions FOR SELECT
  USING (farmer_id = auth.uid());

CREATE POLICY "Lenders can view their own chat sessions"
  ON chat_sessions FOR SELECT
  USING (lender_id = auth.uid());

-- Policies for chat_messages
CREATE POLICY "Users can view messages from their sessions"
  ON chat_messages FOR SELECT
  USING (
    chat_session_id IN (
      SELECT id FROM chat_sessions 
      WHERE farmer_id = auth.uid() OR lender_id = auth.uid()
    )
  );

-- Grant access to authenticated users
GRANT SELECT ON chat_sessions TO authenticated;
GRANT SELECT ON chat_messages TO authenticated;

-- Add function to clean up old chat sessions (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_chat_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.chat_sessions
  WHERE last_active_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Add a cron job to run the cleanup function daily (if pg_cron extension is available)
-- Uncomment if pg_cron is installed
-- SELECT cron.schedule('0 0 * * *', 'SELECT cleanup_old_chat_sessions()');
