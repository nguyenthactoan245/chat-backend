import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { BotService } from './bot.service';
import { MessageModule } from '../message/message.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [MessageModule, UserModule],
  providers: [ChatGateway, ChatService, BotService],
})
export class ChatModule {}