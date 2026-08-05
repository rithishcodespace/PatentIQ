import type { PrismaClient } from '@prisma/client';
import type { UserProfileDto, UpdateUserProfileDto } from '../dto/users.dto.js';

export class UsersRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<UserProfileDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'user',
      createdAt: user.createdAt,
    };
  }

  async update(id: string, data: UpdateUserProfileDto): Promise<UserProfileDto> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.email ? { email: data.email.toLowerCase() } : {}),
        ...(data.name ? { name: data.name } : {}),
      },
    });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'user',
      createdAt: user.createdAt,
    };
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.user.delete({
      where: { id },
    });
    return true;
  }
}

