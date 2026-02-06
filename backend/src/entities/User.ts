import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Item } from './Item';
import { Transaction } from './Transaction';
import { SharedResource } from './SharedResource';
import { ResourceBorrow } from './ResourceBorrow';
import { Message } from './Message';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  username!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  realName?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  studentId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 5.0 })
  rating!: number;

  @Column({ type: 'int', default: 0 })
  ratingCount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Item, (item) => item.seller)
  items!: Item[];

  @OneToMany(() => Transaction, (transaction) => transaction.buyer)
  purchases!: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.seller)
  sales!: Transaction[];

  @OneToMany(() => SharedResource, (resource) => resource.owner)
  sharedResources!: SharedResource[];

  @OneToMany(() => ResourceBorrow, (borrow) => borrow.borrower)
  borrowings!: ResourceBorrow[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages!: Message[];

  @OneToMany(() => Message, (message) => message.receiver)
  receivedMessages!: Message[];
}
