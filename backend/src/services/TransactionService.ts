import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Transaction, TransactionStatus, PaymentMethod } from '../entities/Transaction';
import { Item, ItemStatus } from '../entities/Item';
import { ApiError } from '../middlewares/errorHandler';
import { UserService } from './UserService';

export interface CreateTransactionDto {
  itemId: number;
  price?: number;
  buyerNote?: string;
  meetingLocation?: string;
  meetingTime?: Date;
  paymentMethod?: PaymentMethod;
}

export interface UpdateTransactionDto {
  status?: TransactionStatus;
  finalPrice?: number;
  meetingLocation?: string;
  meetingTime?: Date;
  paymentMethod?: PaymentMethod;
  sellerNote?: string;
}

export interface RateTransactionDto {
  rating: number;
  review?: string;
}

export class TransactionService {
  private transactionRepository: Repository<Transaction>;
  private itemRepository: Repository<Item>;
  private userService: UserService;

  constructor() {
    this.transactionRepository = AppDataSource.getRepository(Transaction);
    this.itemRepository = AppDataSource.getRepository(Item);
    this.userService = new UserService();
  }

  async create(buyerId: number, dto: CreateTransactionDto): Promise<Transaction> {
    const item = await this.itemRepository.findOne({
      where: { id: dto.itemId },
      relations: ['seller'],
    });

    if (!item) {
      throw new ApiError(404, '物品不存在');
    }

    if (item.status !== ItemStatus.AVAILABLE) {
      throw new ApiError(400, '物品当前不可购买');
    }

    if (item.sellerId === buyerId) {
      throw new ApiError(400, '不能购买自己的物品');
    }

    // Check if buyer already has a pending transaction for this item
    const existingTransaction = await this.transactionRepository.findOne({
      where: {
        itemId: dto.itemId,
        buyerId,
        status: TransactionStatus.PENDING,
      },
    });

    if (existingTransaction) {
      throw new ApiError(400, '您已经对此物品发起了交易请求');
    }

    const transaction = this.transactionRepository.create({
      itemId: dto.itemId,
      buyerId,
      sellerId: item.sellerId,
      price: dto.price || Number(item.price),
      buyerNote: dto.buyerNote,
      meetingLocation: dto.meetingLocation,
      meetingTime: dto.meetingTime,
      paymentMethod: dto.paymentMethod,
      status: TransactionStatus.PENDING,
    });

    await this.transactionRepository.save(transaction);

    return this.findById(transaction.id);
  }

  async findById(id: number): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['item', 'buyer', 'seller'],
    });

    if (!transaction) {
      throw new ApiError(404, '交易不存在');
    }

    return transaction;
  }

  async accept(id: number, sellerId: number, dto?: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.findById(id);

    if (transaction.sellerId !== sellerId) {
      throw new ApiError(403, '无权操作此交易');
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new ApiError(400, '当前状态不能接受交易');
    }

    transaction.status = TransactionStatus.ACCEPTED;
    if (dto) {
      Object.assign(transaction, dto);
    }

    // Update item status to reserved
    await this.itemRepository.update(
      { id: transaction.itemId },
      { status: ItemStatus.RESERVED }
    );

    await this.transactionRepository.save(transaction);

    return this.findById(id);
  }

  async reject(id: number, sellerId: number, note?: string): Promise<Transaction> {
    const transaction = await this.findById(id);

    if (transaction.sellerId !== sellerId) {
      throw new ApiError(403, '无权操作此交易');
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new ApiError(400, '当前状态不能拒绝交易');
    }

    transaction.status = TransactionStatus.REJECTED;
    if (note) {
      transaction.sellerNote = note;
    }

    await this.transactionRepository.save(transaction);

    return this.findById(id);
  }

  async markAsPaid(id: number, buyerId: number, paymentMethod?: PaymentMethod): Promise<Transaction> {
    const transaction = await this.findById(id);

    if (transaction.buyerId !== buyerId) {
      throw new ApiError(403, '无权操作此交易');
    }

    if (transaction.status !== TransactionStatus.ACCEPTED) {
      throw new ApiError(400, '当前状态不能标记为已付款');
    }

    transaction.status = TransactionStatus.PAID;
    if (paymentMethod) {
      transaction.paymentMethod = paymentMethod;
    }

    await this.transactionRepository.save(transaction);

    return this.findById(id);
  }

  async markAsShipped(id: number, sellerId: number): Promise<Transaction> {
    const transaction = await this.findById(id);

    if (transaction.sellerId !== sellerId) {
      throw new ApiError(403, '无权操作此交易');
    }

    if (transaction.status !== TransactionStatus.PAID) {
      throw new ApiError(400, '当前状态不能标记为已发货');
    }

    transaction.status = TransactionStatus.SHIPPED;

    await this.transactionRepository.save(transaction);

    return this.findById(id);
  }

  async complete(id: number, buyerId: number): Promise<Transaction> {
    const transaction = await this.findById(id);

    if (transaction.buyerId !== buyerId) {
      throw new ApiError(403, '无权操作此交易');
    }

    if (![TransactionStatus.PAID, TransactionStatus.SHIPPED].includes(transaction.status)) {
      throw new ApiError(400, '当前状态不能完成交易');
    }

    transaction.status = TransactionStatus.COMPLETED;
    transaction.completedAt = new Date();

    // Update item status to sold
    await this.itemRepository.update(
      { id: transaction.itemId },
      { status: ItemStatus.SOLD }
    );

    await this.transactionRepository.save(transaction);

    return this.findById(id);
  }

  async cancel(id: number, userId: number, note?: string): Promise<Transaction> {
    const transaction = await this.findById(id);

    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      throw new ApiError(403, '无权操作此交易');
    }

    if ([TransactionStatus.COMPLETED, TransactionStatus.CANCELLED].includes(transaction.status)) {
      throw new ApiError(400, '当前状态不能取消交易');
    }

    transaction.status = TransactionStatus.CANCELLED;

    if (note) {
      if (userId === transaction.buyerId) {
        transaction.buyerNote = note;
      } else {
        transaction.sellerNote = note;
      }
    }

    // Restore item status if it was reserved
    const item = await this.itemRepository.findOne({ where: { id: transaction.itemId } });
    if (item && item.status === ItemStatus.RESERVED) {
      await this.itemRepository.update(
        { id: transaction.itemId },
        { status: ItemStatus.AVAILABLE }
      );
    }

    await this.transactionRepository.save(transaction);

    return this.findById(id);
  }

  async rateBySeller(id: number, sellerId: number, dto: RateTransactionDto): Promise<Transaction> {
    const transaction = await this.findById(id);

    if (transaction.sellerId !== sellerId) {
      throw new ApiError(403, '无权操作此交易');
    }

    if (transaction.status !== TransactionStatus.COMPLETED) {
      throw new ApiError(400, '只能对已完成的交易进行评价');
    }

    if (transaction.sellerRating !== null) {
      throw new ApiError(400, '您已经评价过此交易');
    }

    transaction.sellerRating = dto.rating;
    transaction.sellerReview = dto.review;

    await this.transactionRepository.save(transaction);

    // Update buyer rating
    await this.userService.updateUserRating(transaction.buyerId, dto.rating);

    return this.findById(id);
  }

  async rateByBuyer(id: number, buyerId: number, dto: RateTransactionDto): Promise<Transaction> {
    const transaction = await this.findById(id);

    if (transaction.buyerId !== buyerId) {
      throw new ApiError(403, '无权操作此交易');
    }

    if (transaction.status !== TransactionStatus.COMPLETED) {
      throw new ApiError(400, '只能对已完成的交易进行评价');
    }

    if (transaction.buyerRating !== null) {
      throw new ApiError(400, '您已经评价过此交易');
    }

    transaction.buyerRating = dto.rating;
    transaction.buyerReview = dto.review;

    await this.transactionRepository.save(transaction);

    // Update seller rating
    await this.userService.updateUserRating(transaction.sellerId, dto.rating);

    return this.findById(id);
  }

  async getUserTransactions(
    userId: number,
    role: 'buyer' | 'seller' | 'all' = 'all',
    status?: TransactionStatus
  ): Promise<Transaction[]> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.item', 'item')
      .leftJoinAndSelect('transaction.buyer', 'buyer')
      .leftJoinAndSelect('transaction.seller', 'seller');

    if (role === 'buyer') {
      queryBuilder.where('transaction.buyerId = :userId', { userId });
    } else if (role === 'seller') {
      queryBuilder.where('transaction.sellerId = :userId', { userId });
    } else {
      queryBuilder.where(
        '(transaction.buyerId = :userId OR transaction.sellerId = :userId)',
        { userId }
      );
    }

    if (status) {
      queryBuilder.andWhere('transaction.status = :status', { status });
    }

    queryBuilder.orderBy('transaction.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  async getItemTransactions(itemId: number): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { itemId },
      relations: ['buyer', 'seller'],
      order: { createdAt: 'DESC' },
    });
  }
}
