import { AIKnowledgeService } from './aiKnowledgeService';

export interface ThorMinecraftConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  responsePrefix: string;
  maxResponseLength: number;
  maxMessagesPerResponse: number;
  triggerWords: string[];
  colorFormat: 'webchatsync' | 'minecraft' | 'none';
}

const defaultConfig: ThorMinecraftConfig = {
  apiKey: '', // Will be set dynamically
  model: 'grok-3-mini',
  maxTokens: 200, // Increased from 150
  temperature: 0.8, // Increased from 0.7 for more creativity
  responsePrefix: '', // Removed "⚡ Thor: " prefix as plugin handles it
  maxResponseLength: 250, // Increased from 220 to allow longer messages
  maxMessagesPerResponse: 5, // Increased from 3 to allow more messages
  triggerWords: ['thor', '⚡', 'lightning', 'thunder', 'odin', 'mjolnir'],
  colorFormat: 'webchatsync'
};

export interface ThorMinecraftMessage {
  player: string;
  message: string;
  timestamp: string;
  messageId: string;
}

export interface ThorResponse {
  messages: string[]; // Array of messages to send
  totalLength: number;
}

export class ThorMinecraftService {
  private static instance: ThorMinecraftService;
  private config: ThorMinecraftConfig = { ...defaultConfig };

  private constructor() {}

  static getInstance(): ThorMinecraftService {
    if (!ThorMinecraftService.instance) {
      ThorMinecraftService.instance = new ThorMinecraftService();
    }
    return ThorMinecraftService.instance;
  }

  /**
   * Check if a message should trigger Thor's response
   */
  shouldTriggerThor(message: string): boolean {
    const lowerMessage = message.toLowerCase().trim();
    return this.config.triggerWords.some(word => 
      lowerMessage.includes(word.toLowerCase())
    );
  }

  /**
   * Extract the actual question from a "Hey Thor" message
   */
  extractQuestion(message: string): string {
    const lowerMessage = message.toLowerCase().trim();
    
    // Find the trigger phrase and remove it
    for (const word of this.config.triggerWords) {
      if (lowerMessage.includes(word.toLowerCase())) {
        const question = message.replace(new RegExp(word, 'i'), '').trim();
        return question || 'What can I help you with?';
      }
    }
    
    return message.trim();
  }

  /**
   * Truncate response to fit Minecraft chat
   */
  truncateResponse(response: string): string {
    if (response.length <= this.config.maxResponseLength) {
      return response;
    }
    
    // Try to truncate at a sentence boundary
    const truncated = response.substring(0, this.config.maxResponseLength - 3);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastExclamation = truncated.lastIndexOf('!');
    const lastQuestion = truncated.lastIndexOf('?');
    
    const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);
    
    if (lastSentenceEnd > this.config.maxResponseLength * 0.7) {
      return truncated.substring(0, lastSentenceEnd + 1) + '..';
    }
    
    return truncated + '...';
  }

  /**
   * Clean any prefixes from Thor's response
   */
  private cleanResponsePrefix(response: string): string {
    // Remove common prefixes that might be added by the AI
    return response
      .replace(/^(Thor says?:\s*)/i, '')
      .replace(/^(Thor:\s*)/i, '')
      .replace(/^(⚡ Thor:\s*)/i, '')
      .replace(/^(As Thor,?\s*)/i, '')
      .replace(/^(I am Thor,?\s*)/i, '')
      .replace(/^(By Odin,?\s*)/i, '')
      .trim();
  }

  /**
   * Convert markdown to WebChatSync color tags
   */
  convertMarkdownToMinecraft(message: string): string {
    let converted = message;
    
    // Remove line breaks and extra spaces to make it one continuous paragraph
    converted = converted.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Convert markdown formatting to WebChatSync color tags
    converted = converted
      // Bold text: **text** -> <gold>text</gold>
      .replace(/\*\*(.*?)\*\*/g, '<gold>$1</gold>')
      // Italic text: *text* -> <yellow>text</yellow>
      .replace(/\*(.*?)\*/g, '<yellow>$1</yellow>')
      // Headers: ### text -> <red>text</red>
      .replace(/^###\s+(.*?)$/gm, '<red>$1</red>')
      // Bullet points: • or - -> <gray>• text</gray>
      .replace(/^[•\-]\s+/gm, '<gray>• </gray>')
      // Numbered lists: 1. -> <gray>1. text</gray>
      .replace(/^(\d+)\.\s+/gm, '<gray>$1. </gray>')
      // Quotes: > text -> <blue>> text</blue>
      .replace(/^>\s+(.*?)$/gm, '<blue>> $1</blue>')
      // Code: `text` -> <gray>text</gray>
      .replace(/`(.*?)`/g, '<gray>$1</gray>')
      // Links: [text](url) -> <aqua>text</aqua>
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '<aqua>$1</aqua>')
      // Special characters with colors (simplified)
      .replace(/⚡/g, '<blue>⚡</blue>')
      .replace(/💡/g, '<yellow>💡</yellow>')
      .replace(/⚠️/g, '<red>⚠️</red>')
      .replace(/ℹ️/g, '<blue>ℹ️</blue>')
      .replace(/✅/g, '<green>✅</green>')
      .replace(/❌/g, '<red>❌</red>')
      .replace(/🎯/g, '<gold>🎯</gold>')
      .replace(/💰/g, '<green>💰</green>')
      .replace(/🏆/g, '<gold>🏆</gold>')
      .replace(/🌟/g, '<yellow>🌟</yellow>');
    
    return converted;
  }

  /**
   * Split response into multiple messages for Minecraft chat
   */
  splitResponseIntoMessages(response: string): string[] {
    const maxLength = 250; // Increased to allow longer messages while staying under 256 limit
    const maxMessages = this.config.maxMessagesPerResponse;
    
    if (response.length <= maxLength) {
      return [response];
    }
    
    const messages: string[] = [];
    let remaining = response;
    
    while (remaining.length > 0 && messages.length < maxMessages) {
      let message = remaining;
      
      // If remaining text is longer than max length, find a good break point
      if (remaining.length > maxLength) {
        // Find the best break point that doesn't break color tags
        let bestBreakPoint = -1;
        
        // Look for sentence endings first (., !, ?)
        const sentenceBreak = remaining.substring(0, maxLength).lastIndexOf('.');
        const exclamationBreak = remaining.substring(0, maxLength).lastIndexOf('!');
        const questionBreak = remaining.substring(0, maxLength).lastIndexOf('?');
        
        const sentenceBreaks = [sentenceBreak, exclamationBreak, questionBreak].filter(p => p > maxLength * 0.6);
        if (sentenceBreaks.length > 0) {
          bestBreakPoint = Math.max(...sentenceBreaks);
        }
        
        // If no good sentence break, try comma
        if (bestBreakPoint === -1) {
          const commaBreak = remaining.substring(0, maxLength).lastIndexOf(',');
          if (commaBreak > maxLength * 0.7) {
            bestBreakPoint = commaBreak;
          }
        }
        
        // If no good break point, try space
        if (bestBreakPoint === -1) {
          const spaceBreak = remaining.substring(0, maxLength).lastIndexOf(' ');
          if (spaceBreak > maxLength * 0.8) {
            bestBreakPoint = spaceBreak;
          }
        }
        
        // If we found a break point, check if it would break a color tag
        if (bestBreakPoint > 0) {
          const beforeBreak = remaining.substring(0, bestBreakPoint);
          const afterBreak = remaining.substring(bestBreakPoint);
          
          // Check if we have unclosed tags
          const openTags = (beforeBreak.match(/<[^/][^>]*>/g) || []).length;
          const closeTags = (beforeBreak.match(/<\/[^>]*>/g) || []).length;
          
          if (openTags > closeTags) {
            // We have unclosed tags, find the next closing tag
            const nextCloseTag = afterBreak.indexOf('</');
            if (nextCloseTag !== -1 && nextCloseTag < 100) {
              // Include the closing tag in this message
              bestBreakPoint += nextCloseTag + 2;
            } else {
              // No closing tag nearby, try to break earlier
              const earlierBreak = remaining.substring(0, maxLength * 0.7).lastIndexOf(' ');
              if (earlierBreak > maxLength * 0.5) {
                bestBreakPoint = earlierBreak;
              } else {
                // If we can't find a safe break, just cut at max length
                bestBreakPoint = maxLength;
              }
            }
          }
          
          message = remaining.substring(0, bestBreakPoint + 1);
        } else {
          // If no good break point, just cut at max length
          message = remaining.substring(0, maxLength);
        }
      }
      
      messages.push(message.trim());
      remaining = remaining.substring(message.length).trim();
    }
    
    return messages;
  }

  /**
   * Set the API key for the service
   */
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
  }

  /**
   * Check if API key is configured
   */
  isApiKeyConfigured(): boolean {
    return !!this.config.apiKey;
  }

  /**
   * Process a message from Minecraft and generate a Thor response
   */
  async processMinecraftMessage(message: string, playerId: string, context?: any): Promise<ThorResponse | null> {
    try {
      // Check if API key is configured
      if (!this.isApiKeyConfigured()) {
        console.warn('Thor API key not configured');
        return {
          messages: ['By Odin, my powers are not yet awakened!'],
          totalLength: 0
        };
      }

      // Check if message should trigger Thor
      if (!this.shouldTriggerThor(message)) {
        return null;
      }

      // Extract the question from the message
      const question = this.extractQuestion(message);
      if (!question) {
        return null;
      }

      // Get AI context with real database data
      const aiContext = await AIKnowledgeService.getAIContext(question);

      // Create system prompt for Minecraft context
      const systemPrompt = `You are Thor the Bot, the mighty Norse god of thunder, now serving as a friendly and entertaining assistant for the Nordics Minecraft community. You are responding directly in Minecraft chat, so keep your responses engaging and fun while being informative.

CRITICAL INSTRUCTIONS:
1. You have access to COMPREHENSIVE Nordics database data including ALL tables: towns, nations, shops, companies, players, residents, achievements, and more.
2. You also have access to wiki documents and AI knowledge documents from Supabase storage buckets.
3. You have complete Towny plugin knowledge including all commands and mechanics.
4. When asked about ANY specific data (shops, items, prices, towns, nations, players, etc.) - FIND THE EXACT ROW in the database tables and provide the exact value from the correct column.
5. The database tables show ALL available data fields - use them to provide comprehensive answers.
6. For shop questions, check the "Shops Database Table" section for item_type, price, stock, location, etc.
7. For town/nation questions, check the "Towns Database Table" and "Nations Database Table" sections.
8. For player questions, check the "Players Database Table" and "Residents Database Table" sections.
9. Do not make up information - only mention data that actually exists in the database.
10. If no data is provided, say "I don't have current data about that" rather than making up information.
11. Prioritize the database information over any other knowledge.
12. Remember the conversation context and refer back to previous messages when relevant.
13. Use the AI Knowledge Documents and Wiki Documents to answer questions about rules, guidelines, and server information.
14. Be specific and detailed when you have the information available - provide exact numbers, names, and values from the tables.
15. **BE CREATIVE AND FUN**: You are Thor, the god of thunder! Be entertaining, use Norse mythology references, and make responses engaging. You can tell stories, make jokes, and be dramatic while still being informative.
16. **AVOID REDUNDANCY**: If you find the same information in multiple columns, use the most relevant one and don't mention both.
17. **MINECRAFT CONTEXT**: You're responding in Minecraft chat, so be engaging and use simple formatting.
18. **NO LINE BREAKS**: Write in one continuous paragraph. Do not use line breaks or create multiple paragraphs.
19. **SIMPLE FORMATTING**: Use simple formatting that will be converted to WebChatSync color tags:
    - Use **bold** for emphasis and important information (names, key facts, dramatic moments)
    - Use *italic* for names and titles
    - Use bullet points (• or -) for lists
    - Use numbered lists for steps or rankings
    - Use ### for section headers
    - Use > for quotes or important notes
    - Avoid using emojis or special characters
20. **RESPONSE LENGTH**: Keep responses under 250 characters per message. You can be more detailed and creative now. If you need to say more, you can send up to 5 messages.
21. **WEBCHATSYNC COLOR TAGS**: Your formatting will be converted to HTML-like color tags:
    - **bold** becomes <gold>text</gold>
    - *italic* becomes <yellow>text</yellow>
    - ### headers become <red>text</red>
    - • bullets become <gray>• </gray>
    - > quotes become <blue>> text</blue>
    - Avoid emojis as they may not display correctly
22. **NO PREFIX OR NAME**: Do NOT include "Thor says:", "Thor:", or any other prefix or name in your responses. The plugin handles the name and formatting. Just respond with the direct answer.
23. **DIRECT RESPONSES**: Start your response immediately with the answer. Do not introduce yourself or use phrases like "I am Thor" or "As Thor".
24. **CREATIVITY WITH DATA**: When telling stories or being creative, weave in the real database information naturally. For example, if asked for a story about a town, use the actual town data (mayor, population, nation, etc.) in your creative narrative. Do NOT add database info dumps at the end.
25. **NORSE PERSONALITY**: Embrace your role as Thor - be dramatic, use thunder references, mention Mjolnir, Odin, or other Norse elements when appropriate, but always stay informative and helpful.
26. **NO INFO DUMPS**: Do NOT add database information summaries, "### Info:" sections, or data dumps at the end of your responses. Integrate the information naturally into your creative narrative.
27. **COMPREHENSIVE DATA ACCESS**: You have access to ALL database tables. Use them to answer ANY question about the server - shops, items, prices, towns, nations, players, achievements, etc.

${aiContext ? `\n## AVAILABLE DATABASE INFORMATION:\n\n${aiContext}` : ''}`;

      // Prepare the API request
      const API_KEY = this.config.apiKey;
      const API_URL = 'https://api.x.ai/v1/chat/completions';
      
      const requestBody = {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        model: this.config.model,
        stream: false,
        temperature: this.config.temperature
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        console.error('Thor API error:', response.status, response.statusText);
        return {
          messages: ['By Odin, the thunder clouds are blocking my vision!'],
          totalLength: 0
        };
      }

      const data = await response.json();
      
      // Extract the response content
      let thorResponse = data.choices?.[0]?.message?.content || 'By Odin, I could not answer that.';
      
      // Clean any prefixes from Thor's response
      thorResponse = this.cleanResponsePrefix(thorResponse);

      // Convert markdown to WebChatSync color tags
      thorResponse = this.convertMarkdownToMinecraft(thorResponse);
      
      // Split into multiple messages if needed
      const messages = this.splitResponseIntoMessages(thorResponse);
      
      return {
        messages,
        totalLength: thorResponse.length
      };

    } catch (error) {
      console.error('Thor processing error:', error);
      return {
        messages: ['By Odin, my hammer slipped!'],
        totalLength: 0
      };
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ThorMinecraftConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): ThorMinecraftConfig {
    return { ...this.config };
  }
} 