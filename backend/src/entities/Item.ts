import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';
import { Category } from './Category';
import { Transaction } from './Transaction';

export enum ItemStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  SOLD = 'sold',
  REMOVED = 'removed',
}

export enum ItemCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Index()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice?: number;

  @Column({ type: 'enum', enum: ItemCondition, default: ItemCondition.GOOD })
  condition!: ItemCondition;

  @Column({ type: 'enum', enum: ItemStatus, default: ItemStatus.AVAILABLE })
  status!: ItemStatus;

  @Column({ type: 'simple-array', nullable: true })
  images?: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({ type: 'int', default: 0 })
  viewCount!: number;

  @Column({ type: 'int', default: 0 })
  favoriteCount!: number;

  @Index()
  @Column({ type: 'int' })
  sellerId!: number;

  @Index()
  @Column({ type: 'int', nullable: true })
  categoryId?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.items)
  @JoinColumn({ name: 'sellerId' })
  seller!: User;

  @ManyToOne(() => Category, (category) => category.items)
  @JoinColumn({ name: 'categoryId' })
  category?: Category;

  @OneToMany(() => Transaction, (transaction) => transaction.item)
  transactions!: Transaction[];
}
