import type { UserProfileDto, UpdateUserProfileDto } from '../dto/users.dto.js';

export class UsersRepository {
  constructor() {
    // TODO: Inject PrismaClient dependency
  }

  async findById(_id: string): Promise<UserProfileDto | null> {
    // TODO: Query database via Prisma for user by ID
    return null;
  }

  async update(id: string, data: UpdateUserProfileDto): Promise<UserProfileDto> {
    // TODO: Update user via Prisma
    return {
      id,
      email: data.email ?? 'user@example.com',
      name: data.name ?? 'User',
      role: 'user',
    };
  }

  async delete(_id: string): Promise<boolean> {
    // TODO: Delete user via Prisma
    return true;
  }
}
