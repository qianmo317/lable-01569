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
import { SharedResource } from './SharedResource';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon?: string;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'enum', enum: ['item', 'resource'], default: 'item' })
  type!: 'item' | 'resource';

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Item, (item) => item.category)
  items!: Item[];

  @OneToMany(() => SharedResource, (resource) => resource.category)
  resources!: SharedResource[];
}
