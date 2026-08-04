import bcrypt from 'bcrypt';
import type { IAuthService } from '../interfaces/auth-service.interface.js';
import type { LoginDto, RegisterDto, AuthResponseDto } from '../dto/auth.dto.js';
import { AuthRepository } from '../repositories/auth.repository.js';
import { ConflictError, UnauthorizedError } from '../../../common/errors/http-errors.js';

export class AuthService implements IAuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtSigner?: (payload: object) => string
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.authRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError('A user with this email address already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.authRepository.createUser({
      email: dto.email,
      passwordHash,
      name: dto.name,
    });

    const payload = { id: user.id, email: user.email, name: user.name };
    const token = this.jwtSigner ? this.jwtSigner(payload) : 'session-token';

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.authRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const payload = { id: user.id, email: user.email, name: user.name };
    const token = this.jwtSigner ? this.jwtSigner(payload) : 'session-token';

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async validateSession(_token: string): Promise<boolean> {
    return true;
  }
}

