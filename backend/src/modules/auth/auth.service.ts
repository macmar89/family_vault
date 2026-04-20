import { Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/users.repository';
import * as argon2 from 'argon2';
import { LoginUserDto } from './dto/login-user.dto';
import { MESSAGES } from '../../common/constants/messages';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { hashToken } from 'src/common/utils/crypto.utils';

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

    async createInitialOwner(createUserDto: CreateUserDto, userAgent?: string) {
        const userCount = await this.userRepository.countUsers();

        if (userCount > 0) {
            throw new ForbiddenException(MESSAGES.AUTH.VAULT_LOCKED);
        }

        const hashedPassword = hashToken(createUserDto.password);
        const newUser = await this.userRepository.createInitialUser({
            email: createUserDto.email,
            password: hashedPassword,
            name: createUserDto.name,
            role: UserRole.OWNER,
        });

        const tokens = await this.getTokens(newUser.id, newUser.role, newUser.tokenVersion);
        await this.refreshTokenService.createSession(newUser.id, tokens.refreshToken, userAgent);

        return tokens;
    }

    async loginUser(loginUserDto: LoginUserDto, userAgent: string) {
        const user = await this.userRepository.findByEmail(loginUserDto.email);

        if (!user) {
            throw new UnauthorizedException(MESSAGES.USER.NOT_FOUND);
        }

        const isPasswordValid = await argon2.verify(user.password, loginUserDto.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException(MESSAGES.AUTH.INVALID_CREDENTIALS);
        }

        const tokens = await this.getTokens(user.id, user.role, user.tokenVersion);
        await this.refreshTokenService.createSession(user.id, tokens.refreshToken, userAgent);

        return {tokens, user: {id: user.id, email: user.email, name: user.name, role: user.role}};
    }

    async refreshTokens(refreshTokenFromCookie: string, userAgent: string): Promise<{refreshToken: string}> {
        const hashedRefreshToken = hashToken(refreshTokenFromCookie);
        console.log(hashedRefreshToken)
        const session = await this.refreshTokenService.findByToken(hashedRefreshToken);

        if (!session) {
            throw new UnauthorizedException(MESSAGES.AUTH.REFRESH_TOKEN_NOT_FOUND);
        }

        return {refreshToken: hashedRefreshToken};
    }
}
