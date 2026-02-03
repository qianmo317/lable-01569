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
import { ResourceBorrow } from './ResourceBorrow';

export enum ResourceStatus {
  AVAILABLE = 'available',
  BORROWED = 'borrowed',
  UNAVAILABLE = 'unavailable',
}

export enum ResourceType {
  BOOK = 'book',
  TOOL = 'tool',
  DEVICE = 'device',
  DOCUMENT = 'document',
  OTHER = 'other',
}

@Entity('shared_resources')
export class SharedResource {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'enum', enum: ResourceType, default: ResourceType.OTHER })
  type!: ResourceType;

  @Column({ type: 'enum', enum: ResourceStatus, default: ResourceStatus.AVAILABLE })
  status!: ResourceStatus;

  @Column({ type: 'simple-array', nullable: true })
  images?: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({ type: 'int', default: 7 })
  maxBorrowDays!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  depositAmount!: number;

  @Column({ type: 'boolean', default: true })
  isFree!: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  dailyFee!: number;

  @Column({ type: 'int', default: 0 })
  borrowCount!: number;

  @Column({ type: 'int', default: 0 })
  viewCount!: number;

  @Index()
  @Column({ type: 'int' })
  ownerId!: number;

  @Index()
  @Column({ type: 'int', nullable: true })
  categoryId?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.sharedResources)
  @JoinColumn({ name: 'ownerId' })
  owner!: User;

  @ManyToOne(() => Category, (category) => category.resources)
  @JoinColumn({ name: 'categoryId' })
  category?: Category;

  @OneToMany(() => ResourceBorrow, (borrow) => borrow.resource)
  borrowRecords!: ResourceBorrow[];
}
