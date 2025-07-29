
import { supabase } from '@/integrations/supabase/client';

export const contactPlayer = async (
  senderId: string, // This is expected to be a public.profiles.id (which is auth.user.id)
  receiverId: string, // This is expected to be a public.profiles.id
  subject: string,
  content: string,
  context?: string
) => {
  console.log(`Attempting to send message from senderId (profiles.id): ${senderId} to receiverId (profiles.id): ${receiverId}`, { subject, content, context });
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: senderId,
          receiver_id: receiverId,
          subject: subject || null,
          content: content,
          context: context || null,
          is_read: false,
        },
      ])
      .select();

    if (error) {
      console.error('Supabase error sending message (contactPlayer):', JSON.stringify(error, null, 2));
      throw error;
    }
    
    console.log('Message sent successfully via Supabase (contactPlayer):', data);
    return { success: true, message: 'Message sent successfully!' };
  } catch (error) {
    // Ensure the caught error is logged, even if it's not a Supabase specific error object
    console.error('Error in contactPlayer catch block:', error instanceof Error ? error.message : JSON.stringify(error, null, 2));
    return { success: false, message: 'Failed to send message. Please try again. Check console for details.' };
  }
};
