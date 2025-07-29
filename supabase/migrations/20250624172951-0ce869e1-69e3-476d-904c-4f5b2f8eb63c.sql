
-- Add tables for real chat functionality with message decay
CREATE TABLE public.chat_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  decay_days INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES public.chat_channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_saved BOOLEAN NOT NULL DEFAULT false,
  is_edited BOOLEAN NOT NULL DEFAULT false,
  parent_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add saved messages table for users
CREATE TABLE public.saved_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Insert default chat channels
INSERT INTO public.chat_channels (name, description, decay_days) VALUES
('general', 'General discussion', 7),
('help', 'Help and support', 30),
('trading', 'Trading and marketplace', 30);

-- Enable RLS
ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_channels (public read)
CREATE POLICY "Anyone can view chat channels" ON public.chat_channels FOR SELECT TO authenticated USING (true);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view all chat messages" ON public.chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own messages" ON public.chat_messages FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Moderators can delete messages" ON public.chat_messages FOR DELETE TO authenticated USING (
  auth.uid() = user_id OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator')
);

-- RLS Policies for saved_chat_messages
CREATE POLICY "Users can view their saved messages" ON public.saved_chat_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can save messages" ON public.saved_chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave their messages" ON public.saved_chat_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Function to clean up old messages (respecting saved messages)
CREATE OR REPLACE FUNCTION public.cleanup_old_chat_messages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.chat_messages 
  WHERE created_at < (NOW() - INTERVAL '1 day' * (
    SELECT decay_days FROM public.chat_channels WHERE id = chat_messages.channel_id
  ))
  AND id NOT IN (
    SELECT message_id FROM public.saved_chat_messages
  );
END;
$$;

-- Add forum post views and replies count
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0;

-- Function to update reply count
CREATE OR REPLACE FUNCTION public.update_post_reply_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_posts 
    SET reply_count = reply_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_posts 
    SET reply_count = reply_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for reply count
DROP TRIGGER IF EXISTS trigger_update_reply_count ON public.forum_replies;
CREATE TRIGGER trigger_update_reply_count
  AFTER INSERT OR DELETE ON public.forum_replies
  FOR EACH ROW EXECUTE FUNCTION public.update_post_reply_count();
