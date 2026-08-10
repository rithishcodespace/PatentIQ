import { UsersRepository } from '../repositories/users.repository.js';
import { NotFoundError } from '../../../common/errors/http-errors.js';
export class UsersService {
    usersRepository;
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async getUserById(id) {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new NotFoundError(`User with ID ${id} not found`);
        }
        return user;
    }
    async updateUser(id, dto) {
        return this.usersRepository.update(id, dto);
    }
    async deleteUser(id) {
        return this.usersRepository.delete(id);
    }
}
//# sourceMappingURL=users.service.js.map