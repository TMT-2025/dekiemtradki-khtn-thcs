import { IAIProvider, AICompletionRequest, AICompletionResponse } from './provider-interface';
import { GeminiProvider } from './gemini-provider';

export { GeminiProvider };

export class OpenAIProvider implements IAIProvider {
  public name = 'OpenAI';
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.model = model || process.env.OPENAI_MODEL || 'gpt-4o';
  }

  public async generateText(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.apiKey) {
      throw new Error('Chưa cấu hình OPENAI_API_KEY');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: request.userPrompt }
        ],
        temperature: request.temperature || 0.2,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model: this.model
    };
  }

  public async generateStructuredJson<T>(request: AICompletionRequest): Promise<T> {
    const res = await this.generateText(request);
    const cleanJson = res.content.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson) as T;
  }
}

export class AnthropicProvider implements IAIProvider {
  public name = 'Anthropic Claude';
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
    this.model = model || process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
  }

  public async generateText(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.apiKey) {
      throw new Error('Chưa cấu hình ANTHROPIC_API_KEY');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        system: request.systemPrompt,
        messages: [{ role: 'user', content: request.userPrompt }],
        max_tokens: 4096,
        temperature: request.temperature || 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      model: this.model
    };
  }

  public async generateStructuredJson<T>(request: AICompletionRequest): Promise<T> {
    const res = await this.generateText(request);
    const cleanJson = res.content.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson) as T;
  }
}

export class AIProviderFactory {
  public static getProvider(providerType?: 'GEMINI' | 'OPENAI' | 'ANTHROPIC'): IAIProvider {
    const type = providerType || (process.env.AI_PROVIDER as any) || 'GEMINI';
    switch (type) {
      case 'OPENAI':
        return new OpenAIProvider();
      case 'ANTHROPIC':
        return new AnthropicProvider();
      case 'GEMINI':
      default:
        return new GeminiProvider();
    }
  }
}
