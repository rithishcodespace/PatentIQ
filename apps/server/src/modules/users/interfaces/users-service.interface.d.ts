import type { UserProfileDto, UpdateUserProfileDto } from '../dto/users.dto.js';
export interface IUsersService {
    getUserById(id: string): Promise<UserProfileDto>;
    updateUser(id: string, dto: UpdateUserProfileDto): Promise<UserProfileDto>;
    deleteUser(id: string): Promise<boolean>;
}
//# sourceMappingURL=users-service.interface.d.ts.map