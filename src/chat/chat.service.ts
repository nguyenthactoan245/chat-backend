import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../message/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  // Lưu tin nhắn mới vào DB
  async saveMessage(content: string, senderId: number, username: string): Promise<Message> {
    const message = this.messageRepository.create({
      content,
      sender: { id: senderId },
    });
    return this.messageRepository.save(message);
  }

  // Lấy 50 tin nhắn gần nhất
  async getMessages(): Promise<any[]> {
    const messages = await this.messageRepository.find({
      relations: ['sender'],           // ← join với bảng users
      order: { createdAt: 'ASC' },
      take: 50,
    });

    // Trả về dạng đơn giản cho frontend
    return messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      username: msg.sender.username,
      createdAt: msg.createdAt,
    }));
  }
}