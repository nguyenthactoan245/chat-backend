import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Tìm user theo username
  findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOneBy({ username });
  }

  findByIds(ids: number[]): Promise<User[]> {
    if (ids.length === 0) return Promise.resolve([]);
    return this.userRepository.findBy(ids.map(id => ({ id })));
  }

  // Tạo user mới
  create(username: string, hashedPassword: string): Promise<User> {
    const user = this.userRepository.create({
      username,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }
}