import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { BotService } from './bot.service';    // ← thêm
import { MessageModule } from '../message/message.module';

@Module({
  imports: [MessageModule],
  providers: [ChatGateway, ChatService, BotService],  // ← thêm BotService
})
export class ChatModule {}