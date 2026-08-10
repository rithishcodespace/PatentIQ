import type { IUsersService } from '../interfaces/users-service.interface.js';
import type { UserProfileDto, UpdateUserProfileDto } from '../dto/users.dto.js';
import { UsersRepository } from '../repositories/users.repository.js';
export declare class UsersService implements IUsersService {
    private readonly usersRepository;
    constructor(usersRepository: UsersRepository);
    getUserById(id: string): Promise<UserProfileDto>;
    updateUser(id: string, dto: UpdateUserProfileDto): Promise<UserProfileDto>;
    deleteUser(id: string): Promise<boolean>;
}
//# sourceMappingURL=users.service.d.ts.map