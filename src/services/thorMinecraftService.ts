import { AIKnowledgeService } from './aiKnowledgeService';
import { supabase } from '@/integrations/supabase/client';

export interface ThorMinecraftConfig {
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
    // API key is now handled securely on the backend
    console.warn('setApiKey is deprecated - API key is now handled securely on the backend');
  }

  /**
   * Check if API key is configured
   */
  isApiKeyConfigured(): boolean {
    // API key is now handled securely on the backend
    return true;
  }

  /**
   * Process a message from Minecraft and generate a Thor response
   */
  async processMinecraftMessage(message: string, playerId: string, context?: any): Promise<ThorResponse | null> {
    try {
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

      try {
        // Call the secure backend proxy
        const { data, error } = await supabase.functions.invoke('thor-minecraft', {
          body: {
            message: question,
            playerId,
            context: aiContext
          }
        });

        if (error) {
          console.error('Thor backend function error:', error);
          return {
            messages: ['By Odin, the thunder clouds are blocking my vision!'],
            totalLength: 0
          };
        }

        if (data.error) {
          console.error('Thor backend error:', data.error);
          return {
            messages: ['By Odin, my hammer slipped!'],
            totalLength: 0
          };
        }

        return {
          messages: data.messages || ['By Odin, I could not answer that.'],
          totalLength: data.totalLength || 0
        };

      } catch (error) {
        console.error('Thor processing error:', error);
        return {
          messages: ['By Odin, my hammer slipped!'],
          totalLength: 0
        };
      }

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