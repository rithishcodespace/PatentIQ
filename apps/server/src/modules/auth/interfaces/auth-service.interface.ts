import type { LoginDto, RegisterDto, AuthResponseDto } from '../dto/auth.dto.js';

export interface IAuthService {
  register(dto: RegisterDto): Promise<AuthResponseDto>;
  login(dto: LoginDto): Promise<AuthResponseDto>;
  validateSession(token: string): Promise<boolean>;
}
