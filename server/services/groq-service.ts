interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqChatRequest {
  messages: GroqMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

interface GroqChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class GroqService {
  private apiKey: string;
  private baseUrl: string = 'https://api.groq.com/openai/v1';
  private defaultModel: string = 'llama-3.1-8b-instant';

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || process.env.GROQ_CLOUD_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('GROQ API key not found. Voice bot responses will use fallback logic.');
    }
  }

  async chatCompletion(request: GroqChatRequest): Promise<string> {
    if (!this.apiKey) {
      return this.getFallbackResponse(request.messages);
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model || this.defaultModel,
          messages: request.messages,
          temperature: request.temperature || 0.7,
          max_tokens: request.max_tokens || 200,
          top_p: request.top_p || 1,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Groq API error (${response.status}):`, errorText);
        return this.getFallbackResponse(request.messages);
      }

      const data: GroqChatResponse = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content.trim();
      }

      throw new Error('No response choices returned from Groq API');
    } catch (error) {
      console.error('Groq API request failed:', error);
      return this.getFallbackResponse(request.messages);
    }
  }

  private getFallbackResponse(messages: GroqMessage[]): string {
    // Get the last user message
    const userMessages = messages.filter(msg => msg.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1]?.content.toLowerCase() || '';

    // Predefined conversation flow for Ola driver support
    if (lastUserMessage.includes('ride nahi mil') || 
        lastUserMessage.includes('rides nahi') || 
        lastUserMessage.includes('2 ghante') ||
        lastUserMessage.includes('online hoon')) {
      return "Ola customer support mein aapka swagat hai. Kya yeh aapka registered number hai?";
    }
    
    if (lastUserMessage.includes('haan') || 
        lastUserMessage.includes('yes') || 
        lastUserMessage.includes('registered number hai') ||
        lastUserMessage.includes('mera number')) {
      return "Aapka number blocked nahi hai. Sab theek hai. Kripya apna location badal kar phir se rides check kijiye.";
    }

    if (lastUserMessage.includes('dhanyawad') || 
        lastUserMessage.includes('thank you') ||
        lastUserMessage.includes('theek hai')) {
      return "Aapka swagat hai! Koi aur samasya ho to hamen call kariye. Ola aapki seva mein hai.";
    }

    // Default fallback
    return "Main aapki madad karne ke liye yahan hoon. Kripya apni samasya batayiye.";
  }

  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Groq health check failed:', error);
      return false;
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  getAvailableModels(): string[] {
    return [
      'llama-3.1-8b-instant',
      'llama-3.1-70b-versatile', // deprecated but kept for reference
      'mixtral-8x7b-32768',
      'gemma-7b-it',
    ];
  }
}

export const groqService = new GroqService();
