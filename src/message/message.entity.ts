import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;              // ← thêm !

  @Column()
  content!: string;         // ← thêm !

  @Column({ nullable: true })
  roomId!: string;        // ← thêm: "1_3" nghĩa là user 1 chat với user 3

  @CreateDateColumn()
  createdAt!: Date;         // ← thêm !

  @ManyToOne(() => User, user => user.messages)
  sender!: User;            // ← thêm !
}