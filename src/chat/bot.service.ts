import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';

@Injectable()
export class BotService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async getReply(userMessage: string): Promise<string> {
    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant in a chat application. Reply concisely and naturally.',
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        max_tokens: 1024,
      });

      return completion.choices[0]?.message?.content ?? 'Xin lỗi, bot không có phản hồi.';
    } catch (error) {
      console.error('Groq error:', error);
      return 'Xin lỗi, bot đang bận. Thử lại sau nhé!';
    }
  }
}
