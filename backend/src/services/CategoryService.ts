import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Category } from '../entities/Category';
import { ApiError } from '../middlewares/errorHandler';

export interface CreateCategoryDto {
  name: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  type: 'item' | 'resource';
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export class CategoryService {
  private categoryRepository: Repository<Category>;

  constructor() {
    this.categoryRepository = AppDataSource.getRepository(Category);
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoryRepository.findOne({
      where: { name: dto.name, type: dto.type },
    });

    if (existingCategory) {
      throw new ApiError(400, '同类型分类名称已存在');
    }

    const category = this.categoryRepository.create(dto);
    await this.categoryRepository.save(category);

    return category;
  }

  async findById(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new ApiError(404, '分类不存在');
    }

    return category;
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id);

    if (dto.name && dto.name !== category.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: dto.name, type: category.type },
      });

      if (existingCategory) {
        throw new ApiError(400, '同类型分类名称已存在');
      }
    }

    Object.assign(category, dto);
    await this.categoryRepository.save(category);

    return category;
  }

  async delete(id: number): Promise<void> {
    const category = await this.findById(id);
    category.isActive = false;
    await this.categoryRepository.save(category);
  }

  async getAll(type?: 'item' | 'resource'): Promise<Category[]> {
    const where: any = { isActive: true };
    if (type) {
      where.type = type;
    }

    return this.categoryRepository.find({
      where,
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async getItemCategories(): Promise<Category[]> {
    return this.getAll('item');
  }

  async getResourceCategories(): Promise<Category[]> {
    return this.getAll('resource');
  }
}
