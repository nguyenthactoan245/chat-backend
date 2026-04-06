import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(username: string, password: string) {
    // Kiểm tra username đã tồn tại chưa
    const existing = await this.userService.findByUsername(username);
    if (existing) {
      throw new ConflictException('Username đã tồn tại');
    }

    // Hash password trước khi lưu vào DB
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.create(username, hashedPassword);

    return { message: 'Đăng ký thành công', userId: user.id };
  }

  async login(username: string, password: string) {
    // Tìm user theo username
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Username hoặc password không đúng');
    }

    // So sánh password nhập vào với password đã hash trong DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Username hoặc password không đúng');
    }

    // Tạo JWT token
    const payload = { sub: user.id, username: user.username };
    const token = this.jwtService.sign(payload);

    return { token, username: user.username, userId: user.id };
  }
}