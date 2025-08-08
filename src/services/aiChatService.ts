import { supabase } from '@/integrations/supabase/client'

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIChatResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface AIChatError {
  error: string
}

export class AIChatService {
  private static instance: AIChatService

  public static getInstance(): AIChatService {
    if (!AIChatService.instance) {
      AIChatService.instance = new AIChatService()
    }
    return AIChatService.instance
  }

  async sendMessage(
    messages: AIChatMessage[],
    systemPrompt?: string,
    model: string = 'grok-3-mini',
    temperature: number = 0.7
  ): Promise<AIChatResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages,
          systemPrompt,
          model,
          temperature
        }
      })

      if (error) {
        console.error('AI chat function error:', error)
        throw new Error(error.message || 'Failed to get AI response')
      }

      if (data.error) {
        throw new Error(data.error)
      }

      return data as AIChatResponse
    } catch (error) {
      console.error('AIChatService error:', error)
      throw error
    }
  }

  async sendMessageWithContext(
    userMessage: string,
    conversationHistory: AIChatMessage[],
    systemPrompt?: string,
    context?: string
  ): Promise<AIChatResponse> {
    // Add context to system prompt if provided
    const enhancedSystemPrompt = context 
      ? `${systemPrompt || ''}\n\n## Available Information:\n${context}`
      : systemPrompt

    // Prepare messages array
    const messages = [
      ...conversationHistory,
      { role: 'user' as const, content: userMessage }
    ]

    return this.sendMessage(messages, enhancedSystemPrompt)
  }
}

// Export singleton instance
export const aiChatService = AIChatService.getInstance() 