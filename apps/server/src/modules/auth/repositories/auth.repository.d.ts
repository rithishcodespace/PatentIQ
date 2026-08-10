import type { PrismaClient } from '@prisma/client';
export interface AuthUserRecord {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
}
export declare class AuthRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findByEmail(email: string): Promise<AuthUserRecord | null>;
    createUser(data: {
        email: string;
        passwordHash: string;
        name: string;
    }): Promise<AuthUserRecord>;
}
//# sourceMappingURL=auth.repository.d.ts.map