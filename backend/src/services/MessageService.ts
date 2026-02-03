import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Message, MessageType } from '../entities/Message';
import { ApiError } from '../middlewares/errorHandler';

export interface SendMessageDto {
  receiverId: number;
  content: string;
  type?: MessageType;
  relatedItemId?: number;
  relatedResourceId?: number;
}

export interface ConversationSummary {
  partnerId: number;
  partnerUsername: string;
  partnerAvatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

export class MessageService {
  private messageRepository: Repository<Message>;

  constructor() {
    this.messageRepository = AppDataSource.getRepository(Message);
  }

  async send(senderId: number, dto: SendMessageDto): Promise<Message> {
    if (senderId === dto.receiverId) {
      throw new ApiError(400, '不能给自己发送消息');
    }

    const message = this.messageRepository.create({
      senderId,
      receiverId: dto.receiverId,
      content: dto.content,
      type: dto.type || MessageType.TEXT,
      relatedItemId: dto.relatedItemId,
      relatedResourceId: dto.relatedResourceId,
    });

    await this.messageRepository.save(message);

    return this.findById(message.id);
  }

  async findById(id: number): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['sender', 'receiver'],
    });

    if (!message) {
      throw new ApiError(404, '消息不存在');
    }

    return message;
  }

  async getConversation(
    userId: number,
    partnerId: number,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ messages: Message[]; total: number }> {
    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where(
        '(message.senderId = :userId AND message.receiverId = :partnerId) OR (message.senderId = :partnerId AND message.receiverId = :userId)',
        { userId, partnerId }
      )
      .orderBy('message.createdAt', 'DESC');

    const total = await queryBuilder.getCount();

    const messages = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    // Mark messages as read
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('senderId = :partnerId AND receiverId = :userId AND isRead = false', {
        partnerId,
        userId,
      })
      .execute();

    return { messages: messages.reverse(), total };
  }

  async getConversationList(userId: number): Promise<ConversationSummary[]> {
    // Get all unique conversation partners
    const conversations = await this.messageRepository
      .createQueryBuilder('message')
      .select([
        'CASE WHEN message.senderId = :userId THEN message.receiverId ELSE message.senderId END as partnerId',
        'MAX(message.createdAt) as lastMessageTime',
      ])
      .where('message.senderId = :userId OR message.receiverId = :userId', { userId })
      .groupBy('partnerId')
      .orderBy('lastMessageTime', 'DESC')
      .getRawMany();

    const summaries: ConversationSummary[] = [];

    for (const conv of conversations) {
      const partnerId = conv.partnerId;

      // Get last message
      const lastMessage = await this.messageRepository.findOne({
        where: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId },
        ],
        order: { createdAt: 'DESC' },
        relations: ['sender', 'receiver'],
      });

      if (!lastMessage) continue;

      // Count unread messages
      const unreadCount = await this.messageRepository.count({
        where: {
          senderId: partnerId,
          receiverId: userId,
          isRead: false,
        },
      });

      const partner = lastMessage.senderId === userId ? lastMessage.receiver : lastMessage.sender;

      summaries.push({
        partnerId,
        partnerUsername: partner.username,
        partnerAvatar: partner.avatar,
        lastMessage: lastMessage.content,
        lastMessageTime: lastMessage.createdAt,
        unreadCount,
      });
    }

    return summaries;
  }

  async markAsRead(messageIds: number[], userId: number): Promise<void> {
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('id IN (:...messageIds) AND receiverId = :userId', {
        messageIds,
        userId,
      })
      .execute();
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.messageRepository.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }

  async sendSystemMessage(
    receiverId: number,
    content: string,
    relatedItemId?: number,
    relatedResourceId?: number
  ): Promise<Message> {
    const message = this.messageRepository.create({
      senderId: receiverId, // System messages have same sender and receiver
      receiverId,
      content,
      type: MessageType.SYSTEM,
      relatedItemId,
      relatedResourceId,
    });

    await this.messageRepository.save(message);

    return message;
  }
}
