import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';
import { User } from './user/user.entity';
import { Message } from './message/message.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'toan1234',    // ← đổi thành password của bạn
      database: 'chatapp',
      entities: [User, Message],
      synchronize: true,       // tự tạo bảng khi dev
    }),
    AuthModule,
    UserModule,
    ChatModule,
    MessageModule,
  ],
})
export class AppModule {}