import bcrypt from 'bcrypt';
import { AuthRepository } from '../repositories/auth.repository.js';
import { ConflictError, UnauthorizedError } from '../../../common/errors/http-errors.js';
export class AuthService {
    authRepository;
    jwtSigner;
    constructor(authRepository, jwtSigner) {
        this.authRepository = authRepository;
        this.jwtSigner = jwtSigner;
    }
    async register(dto) {
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
    async login(dto) {
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
    async validateSession(_token) {
        return true;
    }
}
//# sourceMappingURL=auth.service.js.map