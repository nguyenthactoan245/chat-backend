import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,                          // dùng UserService
    PassportModule,
    JwtModule.register({
      secret: 'SECRET_KEY',             // ← phải giống với jwt.strategy.ts
      signOptions: { expiresIn: '7d' }, // token hết hạn sau 7 ngày
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}