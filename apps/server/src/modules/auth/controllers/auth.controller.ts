import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IAuthService } from '../interfaces/auth-service.interface.js';
import type { LoginDto, RegisterDto } from '../dto/auth.dto.js';
import { ResponseFormatter } from '../../../common/utils/response.formatter.js';

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  async register(request: FastifyRequest<{ Body: RegisterDto }>, reply: FastifyReply): Promise<void> {
    const result = await this.authService.register(request.body);
    reply.status(201).send(ResponseFormatter.success(result, 'User registered successfully'));
  }

  async login(request: FastifyRequest<{ Body: LoginDto }>, reply: FastifyReply): Promise<void> {
    const result = await this.authService.login(request.body);
    reply.status(200).send(ResponseFormatter.success(result, 'Login successful'));
  }
}
