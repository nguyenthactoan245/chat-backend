import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../message/message.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private userService: UserService,
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

  // Lấy danh sách hội thoại của user
  async getConversations(userId: number): Promise<any[]> {
    const messages = await this.messageRepository
      .createQueryBuilder('msg')
      .innerJoinAndSelect('msg.sender', 'sender')
      .where('msg.roomId LIKE :p1 OR msg.roomId LIKE :p2', {
        p1: `${userId}_%`,
        p2: `%_${userId}`,
      })
      .orderBy('msg.createdAt', 'DESC')
      .getMany();

    // Group by roomId, lấy tin nhắn cuối cùng
    const roomMap = new Map<string, { otherUserId: number; lastMessage: string; lastMessageTime: Date; isMine: boolean }>();
    for (const msg of messages) {
      if (!roomMap.has(msg.roomId)) {
        const parts = msg.roomId.split('_').map(Number);
        const otherUserId = parts[0] === userId ? parts[1] : parts[0];
        roomMap.set(msg.roomId, {
          otherUserId,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          isMine: msg.sender.id === userId,
        });
      }
    }

    // Lấy username của các user kia
    const otherIds = [...new Set([...roomMap.values()].map(r => r.otherUserId))];
    const users = await this.userService.findByIds(otherIds);
    const userMap = new Map(users.map(u => [u.id, u.username]));

    return [...roomMap.values()].map(r => ({
      userId: r.otherUserId,
      username: userMap.get(r.otherUserId) ?? `User ${r.otherUserId}`,
      lastMessage: r.lastMessage,
      lastMessageTime: r.lastMessageTime,
      isMine: r.isMine,
    }));
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