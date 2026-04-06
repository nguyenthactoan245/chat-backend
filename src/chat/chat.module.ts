import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [MessageModule],   // ← dùng Repository<Message> từ MessageModule
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}