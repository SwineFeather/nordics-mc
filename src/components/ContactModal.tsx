
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Send, X } from 'lucide-react';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  receiverId?: string;
  playerName?: string;
  context?: string;
}

const ContactModal = ({ open, onClose, receiverId, playerName, context }: ContactModalProps) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { contactPlayer } = useProfiles({ fetchAll: false });
  const { user, isAuthenticated } = useAuth();

  const handleSend = async () => {
    if (!isAuthenticated || !user) {
      toast.error('You must be logged in to send messages.');
      return;
    }
    if (!receiverId) {
      toast.error('Recipient not specified.');
      console.error('Receiver ID is undefined in ContactModal');
      return;
    }
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);
    try {
      const result = await contactPlayer(
        user.id,
        receiverId,
        subject.trim(),
        message.trim(),
        context
      );
      
      if (result.success) {
        toast.success(`Message sent to ${playerName}!`);
        setSubject('');
        setMessage('');
        onClose();
      } else {
        toast.error(result.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('An error occurred while sending the message');
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated) {
    return null; 
  }

  return (
    <Dialog open={open} onOpenChange={onClose} modal>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Contact {playerName}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {context && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              Context: {context}
            </div>
          )}

          <div>
            <label htmlFor="contact-subject" className="text-sm font-medium mb-2 block">Subject</label>
            <Input
              id="contact-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject (optional)..."
              className="rounded-xl"
            />
          </div>

          <div>
            <label htmlFor="contact-message" className="text-sm font-medium mb-2 block">Message</label>
            <Textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message..."
              className="min-h-[120px] rounded-xl"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={sending}>
              Cancel
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={!message.trim() || sending || !receiverId}
              className="rounded-xl"
            >
              <Send className="w-4 h-4 mr-2" />
              {sending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;
