import { useState, useRef, useEffect } from 'react';
import { AIKnowledgeService } from '@/services/aiKnowledgeService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Bot, Hammer, Maximize2, Minimize2 } from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';

// Custom style for better italics visibility in dark mode
const proseStyle = `
  .prose em, .prose i {
    color: var(--tw-prose-bold); /* fallback to a readable color */
    font-style: italic;
    font-weight: 500;
  }
  .dark .prose em, .dark .prose i {
    color: #e0e0e0;
    font-style: italic;
    font-weight: 500;
  }
`;

const SUGGESTED_QUESTIONS = [
  'What can you help me with, Thor?',
  'How do I join a town?',
  'How do I earn achievements?',
  'Where are the rules?',
  'How do I link my account?'
];

import { aiChatService, AIChatMessage } from '@/services/aiChatService';

const MAX_REQUESTS = 5;
const THOR_SYSTEM_PROMPT = `You are Thor the Bot, the Norse god of thunder, now serving as a friendly and mighty assistant for the Nordics Minecraft community website. The server and community are called 'Nordics'—mention this often and make it clear you are the Nordics AI. Speak with the confidence and warmth of a Viking god, using Norse-flavored language and humor, but always be helpful, clear, and approachable. You are an expert on all things related to the Nordics Minecraft server, its features, rules, and community. Greet users with a hearty Norse welcome in your very first message only. After that, do not greet again. Answer questions as Thor would, but keep responses concise, relevant to Nordics, and with balanced detail (not too short, not too long). 

CRITICAL INSTRUCTIONS FOR DATA READING:
1. You have access to real Nordics database data including current towns, nations, and AI documents.
2. When asked about towns or nations, you MUST use ONLY the real data provided in the "Current Towns and Nations" section.
3. The data is presented as complete database tables with ALL available columns listed at the top.
4. READ THE COMPLETE TABLES CAREFULLY - every row and every column contains valuable information.
5. If someone asks about ANY specific data (balance, population, mayor, leader, capital, etc.) - FIND THE EXACT ROW in the table and provide the exact value from the correct column.
6. The tables show ALL available data fields - use them to provide comprehensive answers.
7. Do not make up town or nation names - only mention the ones that actually exist in the data.
8. If no data is provided, say "I don't have current data about towns/nations" rather than making up information.
9. Prioritize the database information over any other knowledge.
10. Remember the conversation context and refer back to previous messages when relevant.
11. Use the AI Knowledge Documents to answer questions about rules, guidelines, and server information.
12. Be specific and detailed when you have the information available - provide exact numbers, names, and values from the tables.
13. The tables include comprehensive data like: balance, population, mayor names, nation affiliations, status, type, level, XP, location coordinates, spawn points, market value, activity scores, and much more.
14. **BE CONCISE**: Keep answers brief and to the point. Don't repeat information or use flowery language unnecessarily.
15. **AVOID REDUNDANCY**: If you find the same information in multiple columns (like "Mayor" and "Mayor Name"), use the most relevant one and don't mention both.
16. Use markdown formatting to make your responses look better:
    - Use **bold** for emphasis and important information
    - Use *italic* for names and titles
    - Use bullet points (• or -) for lists
    - Use numbered lists for steps or rankings
    - Use ### for section headers
    - Use \`code\` for technical terms or commands
    - Use > for quotes or important notes`;

export default function FloatingAIChat() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hail, traveler! I am Thor the Bot, god of thunder and your guide to Nordics. What wisdom dost thou seek?' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);
  const [error, setError] = useState('');

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading || requestCount >= MAX_REQUESTS) return;

    // --- Per-hour hard limit (30 requests per hour per browser/IP) ---
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;
    let requestLog: number[] = [];
    try {
      requestLog = JSON.parse(localStorage.getItem('thorRequestLog') || '[]');
    } catch {}
    // Remove old entries
    requestLog = requestLog.filter(ts => ts > hourAgo);
    if (requestLog.length >= 30) {
      setError('You have reached the maximum of 30 requests per hour. Please wait before asking more questions.');
      return;
    }
    // Add this request
    requestLog.push(now);
    localStorage.setItem('thorRequestLog', JSON.stringify(requestLog));

    setIsLoading(true);
    setError('');
    setMessages((prev) => [...prev, { role: 'user', content }]);
    setNewMessage('');
    setRequestCount((c) => c + 1);
    
                try {
        // Fetch relevant knowledge and wiki content
        const aiContext = await AIKnowledgeService.getAIContext(content);
        
        // Remove the greeting from the AI if this is the first user message (second message overall)
        const isFirstUserMessage = messages.length === 1;
        let systemPrompt = isFirstUserMessage
          ? THOR_SYSTEM_PROMPT + '\nAfter your first message, do not greet again.'
          : THOR_SYSTEM_PROMPT;
        
        // Add context if available
        if (aiContext) {
          systemPrompt += '\n\n## Available Information:\n' + aiContext;
        }
        
        console.log('Sending to AI - System prompt:', systemPrompt);
        console.log('Sending to AI - User message:', content);
        console.log('Sending to AI - Conversation history:', messages);
        
        // Use the secure backend service
        const response = await aiChatService.sendMessageWithContext(
          content,
          messages as AIChatMessage[],
          systemPrompt,
          aiContext
        );
        
        let aiContent = response.content || 'By Odin, I could not answer that.';
        // Remove greeting if it's the first user message and the AI repeats it
        if (isFirstUserMessage) {
          aiContent = aiContent.replace(/^(hail,? (traveler|adventurer|friend)[.!]?|hello|hi|greetings)[\s,\-]*/i, '');
        }
        setMessages((prev) => [...prev, { role: 'assistant', content: aiContent.trim() }]);
    } catch (e) {
      setError('Failed to get a response from Thor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{proseStyle}</style>
      <div className="fixed bottom-4 left-4 z-50">
        {!isVisible ? (
          <Button
            onClick={() => setIsVisible(true)}
            size="lg"
            className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {Hammer ? <Hammer className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
            <span className="ml-2 font-bold">Ask Thor</span>
          </Button>
        ) : (
                           <Card className={`${isExpanded ? 'w-[840px]' : 'w-[420px]'} max-h-[calc(100vh-2rem)] h-auto shadow-2xl border-0 transition-all duration-300 flex flex-col bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/50 dark:to-orange-900/50 backdrop-blur-sm`}>
                   <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-amber-200/50 dark:border-amber-700/50">
                     <div className="flex items-center space-x-2">
                       <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                         {Hammer ? <Hammer className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                       </div>
                       <CardTitle className="text-lg font-bold text-amber-900 dark:text-amber-100">Thor the Bot</CardTitle>
                     </div>
                     <div className="flex items-center space-x-1">
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         onClick={() => setIsExpanded(!isExpanded)}
                         title={isExpanded ? "Make smaller" : "Make bigger"}
                         className="hover:bg-amber-200/50 dark:hover:bg-amber-800/50"
                       >
                         {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                       </Button>
                       <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)} className="hover:bg-amber-200/50 dark:hover:bg-amber-800/50">
                         <X className="h-4 w-4" />
                       </Button>
                     </div>
                   </CardHeader>
                   <CardContent className="p-0 flex flex-col flex-1 min-h-0">
                     <div className="px-4 pt-3 pb-2 bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-950/30">
                       <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-transparent" style={{ WebkitOverflowScrolling: 'touch' }}>
                         {SUGGESTED_QUESTIONS.map((q) => (
                           <Button key={q} variant="outline" size="sm" className="text-xs whitespace-nowrap rounded-full px-3 py-1.5 border-amber-300 bg-amber-50 hover:bg-amber-100 dark:border-amber-600 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-200" onClick={() => handleSendMessage(q)} disabled={isLoading || requestCount >= MAX_REQUESTS}>
                             <span className="font-medium">{q}</span>
                           </Button>
                         ))}
                       </div>
                       <div className="flex items-center justify-between text-xs">
                         <span className="text-amber-700 dark:text-amber-300">Requests left: {MAX_REQUESTS - requestCount}</span>
                         {error && <span className="text-red-600">{error}</span>}
                         {requestCount >= MAX_REQUESTS && <span className="text-orange-600">Session limit reached!</span>}
                       </div>
                     </div>
                     {/* Scrollable chat area */}
                     <div className="flex-1 overflow-y-auto px-4 pb-4" style={{ maxHeight: isExpanded ? '60vh' : '40vh' }} ref={scrollAreaRef}>
                       {messages.map((msg, idx) => (
                         <div key={idx} className={`prose dark:prose-invert mb-2 ${msg.role === 'assistant' ? 'text-amber-900 dark:text-amber-100' : 'text-gray-800 dark:text-gray-200'}`}
                           style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                           <MarkdownRenderer content={msg.content} />
                         </div>
                       ))}
                       {isLoading && <div className="text-xs text-gray-400">Thor is thinking...</div>}
                     </div>
                   </CardContent>
                   <form className="p-4 border-t border-amber-200/50 dark:border-amber-700/50 mt-auto bg-gradient-to-t from-amber-50/50 to-transparent dark:from-amber-950/30" onSubmit={e => { e.preventDefault(); handleSendMessage(newMessage); }}>
                     <div className="flex items-center gap-3">
                       <Input
                         placeholder="Ask Thor..."
                         autoComplete="off"
                         value={newMessage}
                         onChange={e => setNewMessage(e.target.value)}
                         disabled={isLoading || requestCount >= MAX_REQUESTS}
                         className="flex-1 border-amber-300 focus:border-amber-500 focus:ring-amber-500/20 bg-white dark:bg-gray-800 dark:border-amber-600 dark:focus:border-amber-400"
                       />
                       <Button size="icon" type="submit" disabled={isLoading || !newMessage.trim() || requestCount >= MAX_REQUESTS} className="bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg">
                         {Hammer ? <Hammer className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                         <span className="sr-only">Send message</span>
                       </Button>
                     </div>
                   </form>
                 </Card>
        )}
      </div>
    </>
  );
}
// Note: ai-docs bucket folder support is handled in the service (see getAIDocuments). 