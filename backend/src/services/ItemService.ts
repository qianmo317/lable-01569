import { Repository, Like, In } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Item, ItemStatus, ItemCondition } from '../entities/Item';
import { ApiError } from '../middlewares/errorHandler';

export interface CreateItemDto {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  condition: ItemCondition;
  categoryId?: number;
  images?: string[];
  location?: string;
}

export interface UpdateItemDto {
  title?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  condition?: ItemCondition;
  categoryId?: number;
  images?: string[];
  location?: string;
  status?: ItemStatus;
}

export interface ItemQueryDto {
  keyword?: string;
  categoryId?: number;
  condition?: ItemCondition;
  minPrice?: number;
  maxPrice?: number;
  status?: ItemStatus;
  sellerId?: number;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'price' | 'viewCount';
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class ItemService {
  private itemRepository: Repository<Item>;

  constructor() {
    this.itemRepository = AppDataSource.getRepository(Item);
  }

  async create(sellerId: number, dto: CreateItemDto): Promise<Item> {
    const item = this.itemRepository.create({
      ...dto,
      sellerId,
      status: ItemStatus.AVAILABLE,
    });

    await this.itemRepository.save(item);

    return this.findById(item.id);
  }

  async findById(id: number): Promise<Item> {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['seller', 'category'],
    });

    if (!item) {
      throw new ApiError(404, '物品不存在');
    }

    // Don't return removed items to regular queries
    if (item.status === ItemStatus.REMOVED) {
      throw new ApiError(404, '物品不存在');
    }

    return item;
  }

  async update(id: number, userId: number, dto: UpdateItemDto): Promise<Item> {
    const item = await this.itemRepository.findOne({
      where: { id },
    });

    if (!item) {
      throw new ApiError(404, '物品不存在');
    }

    if (item.sellerId !== userId) {
      throw new ApiError(403, '无权修改此物品');
    }

    Object.assign(item, dto);
    await this.itemRepository.save(item);

    return this.findById(id);
  }

  async delete(id: number, userId: number): Promise<void> {
    const item = await this.itemRepository.findOne({
      where: { id },
    });

    if (!item) {
      throw new ApiError(404, '物品不存在');
    }

    if (item.sellerId !== userId) {
      throw new ApiError(403, '无权删除此物品');
    }

    item.status = ItemStatus.REMOVED;
    await this.itemRepository.save(item);
  }

  async search(query: ItemQueryDto): Promise<PaginatedResult<Item>> {
    const {
      keyword,
      categoryId,
      condition,
      minPrice,
      maxPrice,
      status = ItemStatus.AVAILABLE,
      sellerId,
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.seller', 'seller')
      .leftJoinAndSelect('item.category', 'category')
      .where('item.status = :status', { status });

    if (keyword) {
      queryBuilder.andWhere(
        '(item.title LIKE :keyword OR item.description LIKE :keyword)',
        { keyword: `%${keyword}%` }
      );
    }

    if (categoryId) {
      queryBuilder.andWhere('item.categoryId = :categoryId', { categoryId });
    }

    if (condition) {
      queryBuilder.andWhere('item.condition = :condition', { condition });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('item.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('item.price <= :maxPrice', { maxPrice });
    }

    if (sellerId) {
      queryBuilder.andWhere('item.sellerId = :sellerId', { sellerId });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy(`item.${sortBy}`, sortOrder)
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const items = await queryBuilder.getMany();

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async incrementViewCount(id: number): Promise<void> {
    await this.itemRepository.increment({ id }, 'viewCount', 1);
  }

  async getByIds(ids: number[]): Promise<Item[]> {
    if (ids.length === 0) return [];

    return this.itemRepository.find({
      where: { id: In(ids) },
      relations: ['seller', 'category'],
    });
  }

  async getUserItems(userId: number, status?: ItemStatus): Promise<Item[]> {
    const where: any = { sellerId: userId };
    if (status) {
      where.status = status;
    }

    return this.itemRepository.find({
      where,
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: number, status: ItemStatus): Promise<Item> {
    const item = await this.itemRepository.findOne({ where: { id } });

    if (!item) {
      throw new ApiError(404, '物品不存在');
    }

    item.status = status;
    await this.itemRepository.save(item);

    return this.findById(id);
  }
}
