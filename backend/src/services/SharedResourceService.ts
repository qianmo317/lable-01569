import { Repository, EntityManager } from 'typeorm';
import { AppDataSource } from '../config/database';
import { SharedResource, ResourceStatus, ResourceType } from '../entities/SharedResource';
import { ResourceBorrow, BorrowStatus } from '../entities/ResourceBorrow';
import { ApiError } from '../middlewares/errorHandler';

export interface CreateResourceDto {
  title: string;
  description: string;
  type: ResourceType;
  categoryId?: number;
  images?: string[];
  location?: string;
  maxBorrowDays?: number;
  depositAmount?: number;
  isFree?: boolean;
  dailyFee?: number;
}

export interface UpdateResourceDto {
  title?: string;
  description?: string;
  type?: ResourceType;
  categoryId?: number;
  images?: string[];
  location?: string;
  maxBorrowDays?: number;
  depositAmount?: number;
  isFree?: boolean;
  dailyFee?: number;
  status?: ResourceStatus;
}

export interface ResourceQueryDto {
  keyword?: string;
  type?: ResourceType;
  categoryId?: number;
  status?: ResourceStatus;
  ownerId?: number;
  isFree?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'borrowCount' | 'viewCount';
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateBorrowDto {
  resourceId: number;
  borrowDate: Date;
  expectedReturnDate: Date;
  borrowerNote?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class SharedResourceService {
  private resourceRepository: Repository<SharedResource>;
  private borrowRepository: Repository<ResourceBorrow>;

  constructor() {
    this.resourceRepository = AppDataSource.getRepository(SharedResource);
    this.borrowRepository = AppDataSource.getRepository(ResourceBorrow);
  }

  async create(ownerId: number, dto: CreateResourceDto): Promise<SharedResource> {
    const resource = this.resourceRepository.create({
      ...dto,
      ownerId,
      status: ResourceStatus.AVAILABLE,
    });

    await this.resourceRepository.save(resource);

    return this.findById(resource.id);
  }

  async findById(id: number): Promise<SharedResource> {
    const resource = await this.resourceRepository.findOne({
      where: { id },
      relations: ['owner', 'category'],
    });

    if (!resource) {
      throw new ApiError(404, '资源不存在');
    }

    return resource;
  }

  async update(id: number, userId: number, dto: UpdateResourceDto): Promise<SharedResource> {
    const resource = await this.resourceRepository.findOne({
      where: { id },
    });

    if (!resource) {
      throw new ApiError(404, '资源不存在');
    }

    if (resource.ownerId !== userId) {
      throw new ApiError(403, '无权修改此资源');
    }

    Object.assign(resource, dto);
    await this.resourceRepository.save(resource);

    return this.findById(id);
  }

  async delete(id: number, userId: number): Promise<void> {
    const resource = await this.resourceRepository.findOne({
      where: { id },
    });

    if (!resource) {
      throw new ApiError(404, '资源不存在');
    }

    if (resource.ownerId !== userId) {
      throw new ApiError(403, '无权删除此资源');
    }

    // Check for active borrows
    const activeBorrow = await this.borrowRepository.findOne({
      where: {
        resourceId: id,
        status: BorrowStatus.BORROWED,
      },
    });

    if (activeBorrow) {
      throw new ApiError(400, '该资源正在被借用，无法删除');
    }

    resource.status = ResourceStatus.UNAVAILABLE;
    await this.resourceRepository.save(resource);
  }

  async search(query: ResourceQueryDto): Promise<PaginatedResult<SharedResource>> {
    const {
      keyword,
      type,
      categoryId,
      status = ResourceStatus.AVAILABLE,
      ownerId,
      isFree,
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.resourceRepository
      .createQueryBuilder('resource')
      .leftJoinAndSelect('resource.owner', 'owner')
      .leftJoinAndSelect('resource.category', 'category')
      .where('resource.status = :status', { status });

    if (keyword) {
      queryBuilder.andWhere(
        '(resource.title LIKE :keyword OR resource.description LIKE :keyword)',
        { keyword: `%${keyword}%` }
      );
    }

    if (type) {
      queryBuilder.andWhere('resource.type = :type', { type });
    }

    if (categoryId) {
      queryBuilder.andWhere('resource.categoryId = :categoryId', { categoryId });
    }

    if (ownerId) {
      queryBuilder.andWhere('resource.ownerId = :ownerId', { ownerId });
    }

    if (isFree !== undefined) {
      queryBuilder.andWhere('resource.isFree = :isFree', { isFree });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy(`resource.${sortBy}`, sortOrder)
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
    await this.resourceRepository.increment({ id }, 'viewCount', 1);
  }

  async getUserResources(userId: number, status?: ResourceStatus): Promise<SharedResource[]> {
    const where: any = { ownerId: userId };
    if (status) {
      where.status = status;
    }

    return this.resourceRepository.find({
      where,
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  // Borrow related methods
  async createBorrowRequest(borrowerId: number, dto: CreateBorrowDto): Promise<ResourceBorrow> {
    const resource = await this.resourceRepository.findOne({
      where: { id: dto.resourceId },
    });

    if (!resource) {
      throw new ApiError(404, '资源不存在');
    }

    if (resource.status !== ResourceStatus.AVAILABLE) {
      throw new ApiError(400, '资源当前不可借用');
    }

    if (resource.ownerId === borrowerId) {
      throw new ApiError(400, '不能借用自己的资源');
    }

    // Check borrow period
    const borrowDays = Math.ceil(
      (new Date(dto.expectedReturnDate).getTime() - new Date(dto.borrowDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (borrowDays > resource.maxBorrowDays) {
      throw new ApiError(400, `借用时间不能超过 ${resource.maxBorrowDays} 天`);
    }

    // Check for existing pending request
    const existingRequest = await this.borrowRepository.findOne({
      where: {
        resourceId: dto.resourceId,
        borrowerId,
        status: BorrowStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new ApiError(400, '您已经对此资源发起了借用请求');
    }

    const borrow = this.borrowRepository.create({
      resourceId: dto.resourceId,
      borrowerId,
      ownerId: resource.ownerId,
      borrowDate: dto.borrowDate,
      expectedReturnDate: dto.expectedReturnDate,
      borrowerNote: dto.borrowerNote,
      status: BorrowStatus.PENDING,
    });

    await this.borrowRepository.save(borrow);

    return this.findBorrowById(borrow.id);
  }

  async findBorrowById(id: number): Promise<ResourceBorrow> {
    const borrow = await this.borrowRepository.findOne({
      where: { id },
      relations: ['resource', 'borrower', 'owner'],
    });

    if (!borrow) {
      throw new ApiError(404, '借用记录不存在');
    }

    return borrow;
  }

  async approveBorrow(id: number, ownerId: number, note?: string): Promise<ResourceBorrow> {
    const borrow = await this.findBorrowById(id);

    if (borrow.ownerId !== ownerId) {
      throw new ApiError(403, '无权操作此借用请求');
    }

    if (borrow.status !== BorrowStatus.PENDING) {
      throw new ApiError(400, '当前状态不能批准借用');
    }

    borrow.status = BorrowStatus.APPROVED;
    if (note) {
      borrow.ownerNote = note;
    }

    await this.borrowRepository.save(borrow);

    return this.findBorrowById(id);
  }

  async rejectBorrow(id: number, ownerId: number, note?: string): Promise<ResourceBorrow> {
    const borrow = await this.findBorrowById(id);

    if (borrow.ownerId !== ownerId) {
      throw new ApiError(403, '无权操作此借用请求');
    }

    if (borrow.status !== BorrowStatus.PENDING) {
      throw new ApiError(400, '当前状态不能拒绝借用');
    }

    borrow.status = BorrowStatus.REJECTED;
    if (note) {
      borrow.ownerNote = note;
    }

    await this.borrowRepository.save(borrow);

    return this.findBorrowById(id);
  }

  async startBorrow(id: number, ownerId: number): Promise<ResourceBorrow> {
    // Use transaction with pessimistic lock to prevent race conditions
    return await AppDataSource.transaction(async (manager: EntityManager) => {
      const borrowRepo = manager.getRepository(ResourceBorrow);
      const resourceRepo = manager.getRepository(SharedResource);

      // Lock the borrow record
      const borrow = await borrowRepo.findOne({
        where: { id },
        relations: ['resource', 'borrower', 'owner'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!borrow) {
        throw new ApiError(404, '借用记录不存在');
      }

      if (borrow.ownerId !== ownerId) {
        throw new ApiError(403, '无权操作此借用请求');
      }

      if (borrow.status !== BorrowStatus.APPROVED) {
        throw new ApiError(400, '当前状态不能开始借用');
      }

      // Lock the resource and check if it's still available
      const resource = await resourceRepo.findOne({
        where: { id: borrow.resourceId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!resource || resource.status !== ResourceStatus.AVAILABLE) {
        throw new ApiError(400, '资源已被其他借用占用');
      }

      // Check if there's already an active borrow for this resource
      const existingBorrow = await borrowRepo.findOne({
        where: {
          resourceId: borrow.resourceId,
          status: BorrowStatus.BORROWED,
        },
      });

      if (existingBorrow) {
        throw new ApiError(400, '该资源已有进行中的借用');
      }

      borrow.status = BorrowStatus.BORROWED;

      // Update resource status
      resource.status = ResourceStatus.BORROWED;
      resource.borrowCount += 1;
      await resourceRepo.save(resource);

      await borrowRepo.save(borrow);

      return borrow;
    });
  }

  async returnResource(id: number, borrowerId: number): Promise<ResourceBorrow> {
    const borrow = await this.findBorrowById(id);

    if (borrow.borrowerId !== borrowerId) {
      throw new ApiError(403, '无权操作此借用请求');
    }

    if (borrow.status !== BorrowStatus.BORROWED) {
      throw new ApiError(400, '当前状态不能归还资源');
    }

    borrow.status = BorrowStatus.RETURNED;
    borrow.actualReturnDate = new Date();

    // Update resource status
    await this.resourceRepository.update(
      { id: borrow.resourceId },
      { status: ResourceStatus.AVAILABLE }
    );

    await this.borrowRepository.save(borrow);

    return this.findBorrowById(id);
  }

  async confirmReturn(id: number, ownerId: number): Promise<ResourceBorrow> {
    const borrow = await this.findBorrowById(id);

    if (borrow.ownerId !== ownerId) {
      throw new ApiError(403, '无权操作此借用请求');
    }

    if (borrow.status !== BorrowStatus.RETURNED) {
      throw new ApiError(400, '当前状态不能确认归还');
    }

    // Status remains RETURNED as final state
    await this.borrowRepository.save(borrow);

    return this.findBorrowById(id);
  }

  async rateBorrow(
    id: number,
    userId: number,
    rating: number,
    review?: string
  ): Promise<ResourceBorrow> {
    const borrow = await this.findBorrowById(id);

    if (borrow.status !== BorrowStatus.RETURNED) {
      throw new ApiError(400, '只能对已完成的借用进行评价');
    }

    if (userId === borrow.borrowerId) {
      if (borrow.borrowerRating !== null) {
        throw new ApiError(400, '您已经评价过此借用');
      }
      borrow.borrowerRating = rating;
      borrow.borrowerReview = review;
    } else if (userId === borrow.ownerId) {
      if (borrow.ownerRating !== null) {
        throw new ApiError(400, '您已经评价过此借用');
      }
      borrow.ownerRating = rating;
      borrow.ownerReview = review;
    } else {
      throw new ApiError(403, '无权操作此借用请求');
    }

    await this.borrowRepository.save(borrow);

    return this.findBorrowById(id);
  }

  async getUserBorrows(
    userId: number,
    role: 'borrower' | 'owner' | 'all' = 'all',
    status?: BorrowStatus
  ): Promise<ResourceBorrow[]> {
    const queryBuilder = this.borrowRepository
      .createQueryBuilder('borrow')
      .leftJoinAndSelect('borrow.resource', 'resource')
      .leftJoinAndSelect('borrow.borrower', 'borrower')
      .leftJoinAndSelect('borrow.owner', 'owner');

    if (role === 'borrower') {
      queryBuilder.where('borrow.borrowerId = :userId', { userId });
    } else if (role === 'owner') {
      queryBuilder.where('borrow.ownerId = :userId', { userId });
    } else {
      queryBuilder.where(
        '(borrow.borrowerId = :userId OR borrow.ownerId = :userId)',
        { userId }
      );
    }

    if (status) {
      queryBuilder.andWhere('borrow.status = :status', { status });
    }

    queryBuilder.orderBy('borrow.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  async getResourceBorrows(resourceId: number): Promise<ResourceBorrow[]> {
    return this.borrowRepository.find({
      where: { resourceId },
      relations: ['borrower', 'owner'],
      order: { createdAt: 'DESC' },
    });
  }
}
