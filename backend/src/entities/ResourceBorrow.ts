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
import { SharedResource } from './SharedResource';

export enum BorrowStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  BORROWED = 'borrowed',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

@Entity('resource_borrows')
export class ResourceBorrow {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'int' })
  resourceId!: number;

  @Index()
  @Column({ type: 'int' })
  borrowerId!: number;

  @Index()
  @Column({ type: 'int' })
  ownerId!: number;

  @Index()
  @Column({ type: 'enum', enum: BorrowStatus, default: BorrowStatus.PENDING })
  status!: BorrowStatus;

  @Column({ type: 'date' })
  borrowDate!: Date;

  @Column({ type: 'date' })
  expectedReturnDate!: Date;

  @Column({ type: 'date', nullable: true })
  actualReturnDate?: Date;

  @Column({ type: 'text', nullable: true })
  borrowerNote?: string;

  @Column({ type: 'text', nullable: true })
  ownerNote?: string;

  @Column({ type: 'int', nullable: true })
  borrowerRating?: number;

  @Column({ type: 'int', nullable: true })
  ownerRating?: number;

  @Column({ type: 'text', nullable: true })
  borrowerReview?: string;

  @Column({ type: 'text', nullable: true })
  ownerReview?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => SharedResource, (resource) => resource.borrowRecords)
  @JoinColumn({ name: 'resourceId' })
  resource!: SharedResource;

  @ManyToOne(() => User, (user) => user.borrowings)
  @JoinColumn({ name: 'borrowerId' })
  borrower!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner!: User;
}
