import { Injectable, ForbiddenException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/users.repository';
import { hashPassword, verifyPassword } from '../../common/utils/security.utils';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { MESSAGES } from '../../common/constants/messages';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { hashToken } from '../../common/utils/crypto.utils';

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UsersRepository,
        private readonly refreshTokenService: RefreshTokenService,
        private readonly jwtService: JwtService) {}

    async getTokens(userId: string, role: UserRole, tokenVersion: number) {
        const accessTokenPayload = { sub: userId, role, tokenVersion };
        const refreshTokenPayload = { sub: userId, tokenVersion };

        const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(accessTokenPayload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '5m',
        }),
        this.jwtService.signAsync(refreshTokenPayload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d',
        }),
        ]);

        return { accessToken, refreshToken };
    }

    async createInitialOwner(createUserDto: CreateUserDto, userAgent?: string, ipAddress?: string) {
        const userCount = await this.userRepository.countUsers();

        if (userCount > 0) {
            throw new ForbiddenException(MESSAGES.AUTH.VAULT_LOCKED);
        }

        const hashedPassword = await hashPassword(createUserDto.password);
        const newUser = await this.userRepository.createInitialUser({
            email: createUserDto.email,
            password: hashedPassword,
            name: createUserDto.name,
            role: UserRole.OWNER,
        });

        const tokens = await this.getTokens(newUser.id, newUser.role, newUser.tokenVersion);
        await this.refreshTokenService.createSession(newUser.id, tokens.refreshToken, userAgent, ipAddress);

        return tokens;
    }

    async loginUser(loginUserDto: LoginUserDto, userAgent: string, ipAddress: string) {
        const user = await this.userRepository.findByEmail(loginUserDto.email);

        if (!user) {
            throw new UnauthorizedException(MESSAGES.USER.NOT_FOUND);
        }

        const isPasswordValid = await verifyPassword(user.password, loginUserDto.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException(MESSAGES.AUTH.INVALID_CREDENTIALS);
        }

        const tokens = await this.getTokens(user.id, user.role, user.tokenVersion);
        await this.refreshTokenService.createSession(user.id, tokens.refreshToken, userAgent, ipAddress);

        return {tokens, user: {id: user.id, email: user.email, name: user.name, role: user.role}};
    }

    async refreshTokens(refreshTokenFromCookie: string, userAgent: string, ipAddress: string) {
        // 1. JWT verification
        let payload: any;
        try {
            payload = await this.jwtService.verifyAsync(refreshTokenFromCookie, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
        } catch (error) {
            throw new UnauthorizedException(MESSAGES.AUTH.REFRESH_TOKEN_INVALID);
        }

        // 2. Database verification (lookup by hashed token)
        // Adding trim() to prevent hash mismatch due to potential whitespace in cookie
        const hashedRefreshToken = hashToken(refreshTokenFromCookie.trim());
        const session = await this.refreshTokenService.findByToken(hashedRefreshToken);

        if (!session) {
            throw new UnauthorizedException(MESSAGES.AUTH.REFRESH_TOKEN_NOT_FOUND);
        }

        // 3. User verification and tokenVersion check
        const user = await this.userRepository.findById(payload.sub);
        if (!user || user.tokenVersion !== payload.tokenVersion) {
            throw new UnauthorizedException(MESSAGES.AUTH.REFRESH_TOKEN_INVALID);
        }

        // 4. Generate new tokens
        const tokens = await this.getTokens(user.id, user.role, user.tokenVersion);

        // 5. Rotate sessions (delete old, create new)
        await this.refreshTokenService.deleteSession(session.id);
        await this.refreshTokenService.createSession(user.id, tokens.refreshToken, userAgent, ipAddress);

        return {
            tokens,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }

    async logout(refreshToken?: string) {
        if (refreshToken) {
            const hashedToken = hashToken(refreshToken.trim());
            const session = await this.refreshTokenService.findByToken(hashedToken);
            if (session) {
                await this.refreshTokenService.deleteSession(session.id);
            }
        }
    }

    async registerUser(registerUserDto: RegisterUserDto) {
        const {email, role, password, name} = registerUserDto 
        const existingUser = await this.userRepository.findByEmail(email);

        if (existingUser) {
            throw new ConflictException(MESSAGES.AUTH.EMAIL_EXISTS);
        }

        const hashedPassword = await hashPassword(password);
        
        await this.userRepository.createUser({
            email,
            password: hashedPassword,
            name,
            role,
        });

        return { message: MESSAGES.AUTH.USER_CREATED };
    }
}
