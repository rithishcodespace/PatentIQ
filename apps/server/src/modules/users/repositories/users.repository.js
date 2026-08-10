export class UsersRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user)
            return null;
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: 'user',
            createdAt: user.createdAt,
        };
    }
    async update(id, data) {
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
    async delete(id) {
        await this.prisma.user.delete({
            where: { id },
        });
        return true;
    }
}
//# sourceMappingURL=users.repository.js.map