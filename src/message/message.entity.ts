import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;              // ← thêm !

  @Column()
  content!: string;         // ← thêm !

  @CreateDateColumn()
  createdAt!: Date;         // ← thêm !

  @ManyToOne(() => User, user => user.messages)
  sender!: User;            // ← thêm !
}