import type { PrismaClient } from '@prisma/client';
import type { UserProfileDto, UpdateUserProfileDto } from '../dto/users.dto.js';
export declare class UsersRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findById(id: string): Promise<UserProfileDto | null>;
    update(id: string, data: UpdateUserProfileDto): Promise<UserProfileDto>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=users.repository.d.ts.map