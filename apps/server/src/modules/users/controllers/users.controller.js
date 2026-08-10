import { ResponseFormatter } from '../../../common/utils/response.formatter.js';
export class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getProfile(request, reply) {
        const user = await this.usersService.getUserById(request.params.id);
        reply.send(ResponseFormatter.success(user));
    }
    async updateProfile(request, reply) {
        const updated = await this.usersService.updateUser(request.params.id, request.body);
        reply.send(ResponseFormatter.success(updated, 'Profile updated successfully'));
    }
    async deleteProfile(request, reply) {
        await this.usersService.deleteUser(request.params.id);
        reply.send(ResponseFormatter.success(null, 'User deleted successfully'));
    }
}
//# sourceMappingURL=users.controller.js.map