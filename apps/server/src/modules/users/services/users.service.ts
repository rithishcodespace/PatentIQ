import type { IUsersService } from '../interfaces/users-service.interface.js';
import type { UserProfileDto, UpdateUserProfileDto } from '../dto/users.dto.js';
import { UsersRepository } from '../repositories/users.repository.js';
import { NotFoundError } from '../../../common/errors/http-errors.js';

export class UsersService implements IUsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getUserById(id: string): Promise<UserProfileDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }
    return user;
  }

  async updateUser(id: string, dto: UpdateUserProfileDto): Promise<UserProfileDto> {
    return this.usersRepository.update(id, dto);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.usersRepository.delete(id);
  }
}
