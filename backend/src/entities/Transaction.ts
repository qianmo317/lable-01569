import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';
import { Item } from './Item';

export enum TransactionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  PAID = 'paid',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

export enum PaymentMethod {
  CASH = 'cash',
  ALIPAY = 'alipay',
  WECHAT = 'wechat',
  BANK_TRANSFER = 'bank_transfer',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'int' })
  itemId!: number;

  @Index()
  @Column({ type: 'int' })
  buyerId!: number;

  @Index()
  @Column({ type: 'int' })
  sellerId!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  finalPrice?: number;

  @Index()
  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status!: TransactionStatus;

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  paymentMethod?: PaymentMethod;

  @Column({ type: 'varchar', length: 255, nullable: true })
  meetingLocation?: string;

  @Column({ type: 'datetime', nullable: true })
  meetingTime?: Date;

  @Column({ type: 'text', nullable: true })
  buyerNote?: string;

  @Column({ type: 'text', nullable: true })
  sellerNote?: string;

  @Column({ type: 'int', nullable: true })
  buyerRating?: number;

  @Column({ type: 'int', nullable: true })
  sellerRating?: number;

  @Column({ type: 'text', nullable: true })
  buyerReview?: string;

  @Column({ type: 'text', nullable: true })
  sellerReview?: string;

  @Column({ type: 'datetime', nullable: true })
  completedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Item, (item) => item.transactions)
  @JoinColumn({ name: 'itemId' })
  item!: Item;

  @ManyToOne(() => User, (user) => user.purchases)
  @JoinColumn({ name: 'buyerId' })
  buyer!: User;

  @ManyToOne(() => User, (user) => user.sales)
  @JoinColumn({ name: 'sellerId' })
  seller!: User;
}
