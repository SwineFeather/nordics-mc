
import ConversationList from '@/components/messages/ConversationList';
import ChatView from '@/components/messages/ChatView';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Messages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);

  useEffect(() => {
    const partnerIdFromUrl = searchParams.get('with');
    if (partnerIdFromUrl) {
      setSelectedPartnerId(partnerIdFromUrl);
    }
  }, [searchParams]);
  
  const handleSelectConversation = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    setSearchParams({ with: partnerId });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
      <main className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex flex-col w-1/3 max-w-sm border-r">
          <ConversationList 
            onSelectConversation={handleSelectConversation} 
            selectedPartnerId={selectedPartnerId} 
          />
        </div>
        <div className="flex-1">
          {user && <ChatView partnerId={selectedPartnerId} currentUser={user} />}
        </div>
      </main>
    </div>
  );
};

export default Messages;
