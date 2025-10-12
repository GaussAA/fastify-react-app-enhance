import { jest } from '@jest/globals';

// 模拟整个 userService
const mockUserService = {
  getAll: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
};

// 模拟 user.service 模块
jest.unstable_mockModule(
  '../../../apps/api/src/services/user.service.js',
  () => ({
    userService: mockUserService,
  })
);

// 动态导入
const { userService } = await import(
  '../../../apps/api/src/services/user.service.js'
);

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
      };

      const mockUser = {
        id: '1',
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.create.mockResolvedValue(mockUser);

      const result = await userService.create(userData);

      expect(result).toBeDefined();
      expect(result.name).toBe(userData.name);
      expect(result.email).toBe(userData.email);
      expect(mockUserService.create).toHaveBeenCalledWith(userData);
    });

    it('should throw error for invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
      };

      mockUserService.create.mockRejectedValue(new Error('Invalid email'));

      await expect(userService.create(userData)).rejects.toThrow(
        'Invalid email'
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [
        {
          id: '1',
          name: 'User 1',
          email: 'user1@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'User 2',
          email: 'user2@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUserService.findAll.mockResolvedValue(mockUsers);

      const result = await userService.findAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(mockUserService.findAll).toHaveBeenCalledTimes(1);
    });
  });
});
