import { FastifyReply, FastifyRequest } from 'fastify';
import { userService } from '../services/user.service.js';
import { logger } from '../utils/logger.js';

export async function getAllUsers(_req: FastifyRequest, reply: FastifyReply) {
  try {
    const users = await userService.getAll();
    return reply.send({
      success: true,
      data: users,
      message: '获取用户列表成功'
    });
  } catch (error) {
    logger.error('获取用户列表失败:', error);
    return reply.status(500).send({
      success: false,
      message: '获取用户列表失败'
    });
  }
}

export async function createUser(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { name, email } = req.body as { name: string; email: string };

    // 基本验证
    if (!name || !email) {
      return reply.status(400).send({
        success: false,
        message: '请提供用户名和邮箱'
      });
    }

    const newUser = await userService.create({ name, email });
    return reply.status(201).send({
      success: true,
      data: newUser,
      message: '用户创建成功'
    });
  } catch (error) {
    logger.error('创建用户失败:', error);
    return reply.status(500).send({
      success: false,
      message: '创建用户失败'
    });
  }
}
