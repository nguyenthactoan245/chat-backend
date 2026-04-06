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

  // Tạo roomId chuẩn từ 2 userId — luôn sắp xếp nhỏ trước lớn sau
  // để user 1 chat user 3 và user 3 chat user 1 cùng 1 roomId
  getRoomId(userId1: number, userId2: number): string {
    return [userId1, userId2].sort((a, b) => a - b).join('_');
  }

  // Lưu tin nhắn kèm roomId
  async saveMessage(
    content: string,
    senderId: number,
    username: string,
    roomId: string,
  ): Promise<Message> {
    const message = this.messageRepository.create({
      content,
      roomId,
      sender: { id: senderId },
    });
    return this.messageRepository.save(message);
  }

  // Lấy tin nhắn theo roomId
  async getMessagesByRoom(roomId: string): Promise<any[]> {
    const messages = await this.messageRepository.find({
      where: { roomId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
      take: 50,
    });

    return messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      roomId: msg.roomId,
      username: msg.sender.username,
      createdAt: msg.createdAt,
    }));
  }
}