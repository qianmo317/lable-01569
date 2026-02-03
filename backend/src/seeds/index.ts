import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { User, UserRole, UserStatus } from '../entities/User';
import { Category } from '../entities/Category';

export const seedDatabase = async (): Promise<void> => {
  console.log('🌱 Checking seed data...');

  const userRepository = AppDataSource.getRepository(User);
  const categoryRepository = AppDataSource.getRepository(Category);

  // Seed admin user
  const adminExists = await userRepository.findOne({
    where: { username: 'admin' },
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const admin = userRepository.create({
      username: 'admin',
      email: 'admin@campus.edu',
      password: hashedPassword,
      realName: '系统管理员',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });
    await userRepository.save(admin);
    console.log('✅ Admin user created');
  }

  // Seed test user
  const testUserExists = await userRepository.findOne({
    where: { username: 'testuser' },
  });

  if (!testUserExists) {
    const hashedPassword = await bcrypt.hash('test123', 12);
    const testUser = userRepository.create({
      username: 'testuser',
      email: 'test@campus.edu',
      password: hashedPassword,
      realName: '测试用户',
      studentId: '2024001',
      department: '计算机学院',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    });
    await userRepository.save(testUser);
    console.log('✅ Test user created');
  }

  // Seed second test user for transactions
  const testUser2Exists = await userRepository.findOne({
    where: { username: 'testuser2' },
  });

  if (!testUser2Exists) {
    const hashedPassword = await bcrypt.hash('test123', 12);
    const testUser2 = userRepository.create({
      username: 'testuser2',
      email: 'test2@campus.edu',
      password: hashedPassword,
      realName: '测试用户2',
      studentId: '2024002',
      department: '软件学院',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    });
    await userRepository.save(testUser2);
    console.log('✅ Test user 2 created');
  }

  // Seed item categories
  const itemCategories = [
    { name: '电子产品', description: '手机、电脑、平板等', type: 'item' as const, sortOrder: 1 },
    { name: '书籍教材', description: '课本、参考书、小说等', type: 'item' as const, sortOrder: 2 },
    { name: '生活用品', description: '日常生活用品', type: 'item' as const, sortOrder: 3 },
    { name: '服装鞋帽', description: '衣服、鞋子、帽子等', type: 'item' as const, sortOrder: 4 },
    { name: '运动器材', description: '体育用品、健身器材等', type: 'item' as const, sortOrder: 5 },
    { name: '文具办公', description: '文具、办公用品等', type: 'item' as const, sortOrder: 6 },
    { name: '其他物品', description: '其他类别物品', type: 'item' as const, sortOrder: 99 },
  ];

  for (const catData of itemCategories) {
    const exists = await categoryRepository.findOne({
      where: { name: catData.name, type: catData.type },
    });
    if (!exists) {
      const category = categoryRepository.create(catData);
      await categoryRepository.save(category);
    }
  }
  console.log('✅ Item categories seeded');

  // Seed resource categories
  const resourceCategories = [
    { name: '教材书籍', description: '可借阅的教材和书籍', type: 'resource' as const, sortOrder: 1 },
    { name: '学习工具', description: '计算器、绘图工具等', type: 'resource' as const, sortOrder: 2 },
    { name: '电子设备', description: '相机、投影仪等', type: 'resource' as const, sortOrder: 3 },
    { name: '运动器材', description: '可借用的运动器材', type: 'resource' as const, sortOrder: 4 },
    { name: '乐器设备', description: '吉他、键盘等乐器', type: 'resource' as const, sortOrder: 5 },
    { name: '其他资源', description: '其他可共享资源', type: 'resource' as const, sortOrder: 99 },
  ];

  for (const catData of resourceCategories) {
    const exists = await categoryRepository.findOne({
      where: { name: catData.name, type: catData.type },
    });
    if (!exists) {
      const category = categoryRepository.create(catData);
      await categoryRepository.save(category);
    }
  }
  console.log('✅ Resource categories seeded');

  console.log('🌱 Seed data check completed');
};
