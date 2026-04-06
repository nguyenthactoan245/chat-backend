import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class BotService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI('AIzaSyAE-Q8nNoCb8V8UG9MYikGFS3NE5OzxE-w'); // ← dán key vào đây
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
  }

    async getReply(userMessage: string): Promise<string> {
    try {
        const result = await this.model.generateContent(userMessage);
        return result.response.text();
    } catch (error) {
        console.error('Gemini error:', error);  // ← đảm bảo dòng này có
        return 'Xin lỗi, bot đang bận. Thử lại sau nhé!';
    }
    }
}