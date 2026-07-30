import type { IAuthService } from '../interfaces/auth-service.interface.js';
import type { LoginDto, RegisterDto, AuthResponseDto } from '../dto/auth.dto.js';
import { AuthRepository } from '../repositories/auth.repository.js';

export class AuthService implements IAuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // TODO: Hash password using bcrypt, save via authRepository, generate JWT token
    console.log(`[AuthService] TODO: Register user ${dto.email}`);
    return {
      token: 'jwt-token-placeholder',
      user: {
        id: 'placeholder-user-id',
        email: dto.email,
        name: dto.name,
      },
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // TODO: Verify user credentials via authRepository & bcrypt, generate JWT token
    console.log(`[AuthService] TODO: Login user ${dto.email}`);
    return {
      token: 'jwt-token-placeholder',
      user: {
        id: 'placeholder-user-id',
        email: dto.email,
        name: 'User Name',
      },
    };
  }

  async validateSession(_token: string): Promise<boolean> {
    // TODO: Validate JWT token signature
    return true;
  }
}
