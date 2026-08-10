import type { IAuthService } from '../interfaces/auth-service.interface.js';
import type { LoginDto, RegisterDto, AuthResponseDto } from '../dto/auth.dto.js';
import { AuthRepository } from '../repositories/auth.repository.js';
export declare class AuthService implements IAuthService {
    private readonly authRepository;
    private readonly jwtSigner?;
    constructor(authRepository: AuthRepository, jwtSigner?: ((payload: object) => string) | undefined);
    register(dto: RegisterDto): Promise<AuthResponseDto>;
    login(dto: LoginDto): Promise<AuthResponseDto>;
    validateSession(_token: string): Promise<boolean>;
}
//# sourceMappingURL=auth.service.d.ts.map