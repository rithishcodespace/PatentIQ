export class AuthRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByEmail(email) {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user)
            return null;
        return {
            id: user.id,
            email: user.email,
            passwordHash: user.passwordHash,
            name: user.name,
        };
    }
    async createUser(data) {
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
//# sourceMappingURL=auth.repository.js.map