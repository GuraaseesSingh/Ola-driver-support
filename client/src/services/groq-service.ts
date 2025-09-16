export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResponse {
  message: string;
  processingTime: number;
}

export class GroqService {
  private systemPrompt = `You are a helpful customer support agent for Ola drivers. You speak fluent Hindi and help drivers with their issues. Follow this exact conversation flow:

1. When a driver reports not getting rides, greet them: "Ola customer support mein aapka swagat hai. Kya yeh aapka registered number hai?"

2. When they confirm their number, check status: "Aapka number blocked nahi hai. Sab theek hai."

3. Then suggest solution: "Kripya apna location badal kar phir se rides check kijiye."

Always respond in Hindi. Keep responses short and helpful. Follow the predefined flow strictly.`;

  private conversationHistory: GroqMessage[] = [
    { role: 'system', content: this.systemPrompt }
  ];

  async sendMessage(userMessage: string): Promise<GroqResponse> {
    const startTime = Date.now();
    
    try {
      // Add user message to history
      this.conversationHistory.push({ role: 'user', content: userMessage });

      const response = await fetch('/api/groq/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: this.conversationHistory,
          temperature: 0.7,
          maxTokens: 200
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.message;
      
      // Add assistant response to history
      this.conversationHistory.push({ role: 'assistant', content: assistantMessage });

      const processingTime = Date.now() - startTime;
      
      return {
        message: assistantMessage,
        processingTime
      };
    } catch (error) {
      console.error('Groq Service error:', error);
      
      // Fallback response in Hindi
      const fallbackResponse = this.getFallbackResponse(userMessage);
      this.conversationHistory.push({ role: 'assistant', content: fallbackResponse });
      
      return {
        message: fallbackResponse,
        processingTime: Date.now() - startTime
      };
    }
  }

  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('ride nahi mil') || lowerMessage.includes('rides nahi')) {
      return "Ola customer support mein aapka swagat hai. Kya yeh aapka registered number hai?";
    }
    
    if (lowerMessage.includes('haan') || lowerMessage.includes('yes') || lowerMessage.includes('registered')) {
      return "Aapka number blocked nahi hai. Sab theek hai. Kripya apna location badal kar phir se rides check kijiye.";
    }
    
    return "Main aapki madad karne ke liye yahan hoon. Kripya apni samasya batayiye.";
  }

  resetConversation(): void {
    this.conversationHistory = [
      { role: 'system', content: this.systemPrompt }
    ];
  }

  getConversationHistory(): GroqMessage[] {
    return [...this.conversationHistory];
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch('/api/groq/health');
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const groqService = new GroqService();
