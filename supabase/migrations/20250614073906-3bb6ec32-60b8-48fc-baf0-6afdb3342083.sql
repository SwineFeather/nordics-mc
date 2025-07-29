
-- Create a table for messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT NOT NULL,
  context TEXT, -- To store where the message was sent from, e.g., "Player Profile"
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN NOT NULL DEFAULT false
);

-- Add Row Level Security (RLS)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert messages where they are the sender
CREATE POLICY "Users can send messages"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Policy: Users can view messages where they are the sender or receiver
CREATE POLICY "Users can view messages"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Policy: Users can update the is_read status of their received messages
CREATE POLICY "Users can update read status"
  ON public.messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Grant usage on the public schema and select on the messages table to authenticated users
-- This is often necessary for RLS to work as expected with function calls from the client.
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON TABLE public.messages TO authenticated;
GRANT INSERT ON TABLE public.messages TO authenticated;
GRANT UPDATE ON TABLE public.messages TO authenticated;

-- Enable real-time on the messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;
-- Add the table to the supabase_realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages' AND schemaname = 'public'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;
