export interface AuthUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
}

export class AuthRepository {
  constructor() {
    // TODO: Inject PrismaClient dependency
  }

  async findByEmail(email: string): Promise<AuthUserRecord | null> {
    // TODO: Query database via Prisma for user by email
    return null;
  }

  async createUser(data: { email: string; passwordHash: string; name: string }): Promise<AuthUserRecord> {
    // TODO: Create new user record via Prisma
    return {
      id: 'placeholder-user-id',
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name,
    };
  }
}
