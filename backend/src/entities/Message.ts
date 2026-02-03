import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  SYSTEM = 'system',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'int' })
  senderId!: number;

  @Index()
  @Column({ type: 'int' })
  receiverId!: number;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'enum', enum: MessageType, default: MessageType.TEXT })
  type!: MessageType;

  @Column({ type: 'boolean', default: false })
  isRead!: boolean;

  @Column({ type: 'int', nullable: true })
  relatedItemId?: number;

  @Column({ type: 'int', nullable: true })
  relatedResourceId?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.sentMessages)
  @JoinColumn({ name: 'senderId' })
  sender!: User;

  @ManyToOne(() => User, (user) => user.receivedMessages)
  @JoinColumn({ name: 'receiverId' })
  receiver!: User;
}
