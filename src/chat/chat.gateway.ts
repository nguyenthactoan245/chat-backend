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

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  // Lưu danh sách user online: socketId → username
  private onlineUsers = new Map<string, string>();

  constructor(private chatService: ChatService) {}

  // Khi có client kết nối
  handleConnection(client: Socket) {
    console.log(`Client kết nối: ${client.id}`);
  }

  // Khi client ngắt kết nối
  handleDisconnect(client: Socket) {
    // Xóa user khỏi danh sách online
    this.onlineUsers.delete(client.id);
    console.log(`Client ngắt kết nối: ${client.id}`);

    // Broadcast danh sách online mới
    this.broadcastOnlineUsers();
  }

  // Lắng nghe event "userOnline" — Angular gửi lên sau khi kết nối
  @SubscribeMessage('userOnline')
  handleUserOnline(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { username: string },
  ) {
    // Lưu username vào Map với key là socketId
    this.onlineUsers.set(client.id, data.username);

    // Broadcast danh sách online mới đến tất cả
    this.broadcastOnlineUsers();
  }

  // Gửi danh sách online đến tất cả client
  private broadcastOnlineUsers() {
    const users = Array.from(this.onlineUsers.values());
    this.server.emit('onlineUsers', users);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { content: string; senderId: number; username: string },
  ) {
    await this.chatService.saveMessage(data.content, data.senderId, data.username);
    this.server.emit('newMessage', {
      content: data.content,
      username: data.username,
      createdAt: new Date(),
    });
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(@ConnectedSocket() client: Socket) {
    const messages = await this.chatService.getMessages();
    client.emit('messageHistory', messages);
  }
}