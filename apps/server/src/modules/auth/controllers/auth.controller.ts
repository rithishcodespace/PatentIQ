import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IAuthService } from '../interfaces/auth-service.interface.js';
import type { LoginDto, RegisterDto } from '../dto/auth.dto.js';
import { ResponseFormatter } from '../../../common/utils/response.formatter.js';

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  async register(request: FastifyRequest<{ Body: RegisterDto }>, reply: FastifyReply): Promise<void> {
    const result = await this.authService.register(request.body);
    if (result.token) {
      reply.setCookie('token', result.token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: false,
        maxAge: 7 * 24 * 60 * 60,
      });
    }
    reply.status(201).send(ResponseFormatter.success({ user: result.user }, 'User registered successfully'));
  }

  async login(request: FastifyRequest<{ Body: LoginDto }>, reply: FastifyReply): Promise<void> {
    const result = await this.authService.login(request.body);
    if (result.token) {
      reply.setCookie('token', result.token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: false,
        maxAge: 7 * 24 * 60 * 60,
      });
    }
    reply.status(200).send(ResponseFormatter.success({ user: result.user }, 'Login successful'));
  }

  async logout(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    reply.clearCookie('token', { path: '/' });
    reply.status(200).send(ResponseFormatter.success(null, 'Successfully logged out'));
  }

  async getMe(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userPayload = request.user as { id: string; email: string; name: string } | undefined;
    if (!userPayload) {
      reply.status(401).send(ResponseFormatter.error('Not authenticated', 401));
      return;
    }
    reply.status(200).send(ResponseFormatter.success({ user: userPayload }, 'Current user profile fetched successfully'));
  }
}

