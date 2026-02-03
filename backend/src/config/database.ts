import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../entities/User';
import { Item } from '../entities/Item';
import { Category } from '../entities/Category';
import { Transaction } from '../entities/Transaction';
import { SharedResource } from '../entities/SharedResource';
import { ResourceBorrow } from '../entities/ResourceBorrow';
import { Message } from '../entities/Message';

const config: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'campus_user',
  password: process.env.DB_PASSWORD || 'campus_password',
  database: process.env.DB_DATABASE || 'campus_trading',
  entities: [User, Item, Category, Transaction, SharedResource, ResourceBorrow, Message],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  charset: 'utf8mb4',
};

export const AppDataSource = new DataSource(config);

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};
