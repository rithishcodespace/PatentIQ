import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IUsersService } from '../interfaces/users-service.interface.js';
import type { UpdateUserProfileDto } from '../dto/users.dto.js';
import { ResponseFormatter } from '../../../common/utils/response.formatter.js';

export class UsersController {
  constructor(private readonly usersService: IUsersService) {}

  async getProfile(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    const user = await this.usersService.getUserById(request.params.id);
    reply.send(ResponseFormatter.success(user));
  }

  async updateProfile(request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserProfileDto }>, reply: FastifyReply): Promise<void> {
    const updated = await this.usersService.updateUser(request.params.id, request.body);
    reply.send(ResponseFormatter.success(updated, 'Profile updated successfully'));
  }

  async deleteProfile(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    await this.usersService.deleteUser(request.params.id);
    reply.send(ResponseFormatter.success(null, 'User deleted successfully'));
  }
}
