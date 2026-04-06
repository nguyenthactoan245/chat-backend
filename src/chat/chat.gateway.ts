import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { BotService } from './bot.service';    // ← thêm

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private onlineUsers = new Map<string, { username: string; userId: number }>();

  constructor(
    private chatService: ChatService,
    private botService: BotService,    // ← thêm
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client kết nối: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.onlineUsers.delete(client.id);
    this.broadcastOnlineUsers();
  }

  @SubscribeMessage('userOnline')
  handleUserOnline(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { username: string; userId: number },
  ) {
    this.onlineUsers.set(client.id, { username: data.username, userId: data.userId });
    this.broadcastOnlineUsers();
  }

  private broadcastOnlineUsers() {
    const seen = new Set<number>();
    const users: { username: string; userId: number }[] = [];
    for (const user of this.onlineUsers.values()) {
      if (!seen.has(user.userId)) {
        seen.add(user.userId);
        users.push(user);
      }
    }
    this.server.emit('onlineUsers', users);
  }

  @SubscribeMessage('sendPrivateMessage')
  async handlePrivateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      content: string;
      senderId: number;
      username: string;
      receiverId: number;
    },
  ) {
    const roomId = this.chatService.getRoomId(data.senderId, data.receiverId);
    await this.chatService.saveMessage(data.content, data.senderId, data.username, roomId);

    const message = {
      content: data.content,
      username: data.username,
      roomId,
      createdAt: new Date(),
    };

    for (const [socketId, user] of this.onlineUsers.entries()) {
      if (user.userId === data.receiverId || user.userId === data.senderId) {
        this.server.to(socketId).emit('newPrivateMessage', message);
      }
    }
  }

  @SubscribeMessage('getPrivateMessages')
  async handleGetPrivateMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { senderId: number; receiverId: number },
  ) {
    const roomId = this.chatService.getRoomId(data.senderId, data.receiverId);
    const messages = await this.chatService.getMessagesByRoom(roomId);
    client.emit('privateMessageHistory', messages);
  }

  // ← thêm: xử lý chat với bot
  @SubscribeMessage('sendBotMessage')
  async handleBotMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { content: string; username: string; senderId: number },
  ) {
    // Gửi lại tin của user trước
    client.emit('newBotMessage', {
      content: data.content,
      username: data.username,
      createdAt: new Date(),
      isBot: false,
    });

    // Gọi Gemini API
    const botReply = await this.botService.getReply(data.content);

    // Gửi reply của bot về cho đúng client
    client.emit('newBotMessage', {
      content: botReply,
      username: 'Gemini Bot',
      createdAt: new Date(),
      isBot: true,
    });
  }
}