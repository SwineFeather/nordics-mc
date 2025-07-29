
-- Drop the old, restrictive policy
DROP POLICY "Users can view their received messages" ON public.messages;

-- Create a new policy that allows users to see messages they've sent or received
CREATE POLICY "Users can view their own messages"
  ON public.messages
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
