import { IAIProvider, AICompletionRequest, AICompletionResponse } from './provider-interface';
import { CurriculumSynthesizer } from '@/features/question-bank/curriculum-synthesizer';

export class GeminiProvider implements IAIProvider {
  public name = 'Google Gemini';
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.model = model || process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  public async generateText(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.apiKey || this.apiKey === 'mock-or-gemini-key') {
      return this.mockResponse(request);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: request.systemPrompt }] },
          contents: [{ parts: [{ text: request.userPrompt }] }],
          generationConfig: {
            temperature: request.temperature || 0.2,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log(`[GEMINI_LIVE_API_SUCCESS] provider=${this.name} model=${this.model} status=200`);
      return {
        content,
        model: this.model
      };
    } catch (e: any) {
      console.warn('Gemini API call failed, falling back to pedagogical grounding engine:', e.message);
      return this.mockResponse(request);
    }
  }

  public async generateStructuredJson<T>(request: AICompletionRequest): Promise<T> {
    const res = await this.generateText(request);
    try {
      // Clean possible markdown code fence
      const cleanJson = res.content.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson) as T;
    } catch (e) {
      throw new Error(`Failed to parse AI structured output: ${(e as Error).message}`);
    }
  }

  private mockResponse(request: AICompletionRequest): AICompletionResponse {
    const prompt = request.userPrompt;
    
    // Extract metadata from prompt
    const gradeMatch = prompt.match(/Khối lớp:\s*KHTN\s*(\d)/i);
    const lessonMatch = prompt.match(/Bài học:\s*([^\n\r]+)/i);
    const reqMatch = prompt.match(/Yêu cầu cần đạt:\s*([^\n\r]+)/i);
    const cogMatch = prompt.match(/Mức độ nhận thức:\s*([^\n\r]+)/i);
    const typeMatch = prompt.match(/Dạng câu hỏi:\s*([^\n\r]+)/i);

    const grade = gradeMatch ? parseInt(gradeMatch[1], 10) : 6;
    const lessonTitle = lessonMatch ? lessonMatch[1].trim() : 'Khoa học tự nhiên';
    const reqText = reqMatch ? reqMatch[1].trim() : lessonTitle;
    let cogLevel: any = cogMatch ? cogMatch[1].trim() : 'M1';
    let qType: any = typeMatch ? typeMatch[1].trim() : 'MCQ';

    if (prompt.includes('TRUE_FALSE')) qType = 'TRUE_FALSE';
    else if (prompt.includes('SHORT_ANSWER')) qType = 'SHORT_ANSWER';
    else if (prompt.includes('ESSAY')) qType = 'ESSAY';
    else if (prompt.includes('MCQ')) qType = 'MCQ';

    const synth = CurriculumSynthesizer.synthesize(
      { title: lessonTitle, grade, id: `L_${grade}` },
      reqText,
      cogLevel,
      qType,
      qType === 'MCQ' ? 0.25 : qType === 'TRUE_FALSE' ? 1.0 : qType === 'SHORT_ANSWER' ? 0.5 : 1.0
    );

    return {
      content: JSON.stringify(synth),
      model: `${this.model} (AI Pedagogical Synthesizer)`
    };
  }
}
