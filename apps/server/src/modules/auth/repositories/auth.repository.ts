import type { PrismaClient } from '@prisma/client';

export interface AuthUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
}

export class AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<AuthUserRecord | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name,
    };
  }

  async createUser(data: { email: string; passwordHash: string; name: string }): Promise<AuthUserRecord> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        name: data.name,
      },
    });
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name,
    };
  }
}

