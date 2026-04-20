import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from './refresh-token.repository';
import { hashToken } from 'src/common/utils/crypto.utils';

@Injectable()
export class RefreshTokenService {
    constructor(private readonly refreshTokenRepository: RefreshTokenRepository) {}

    async createSession(userId: string, refreshToken: string, userAgent?: string, ipAddress?: string) {
        const hashedToken = hashToken(refreshToken);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);  

        await this.refreshTokenRepository.createRefreshToken(userId, hashedToken, expiresAt, userAgent, ipAddress);
    }

    async findByToken(hashedToken: string) {
        return this.refreshTokenRepository.findByToken(hashedToken);
    }

    async deleteSession(id: string) {
        return this.refreshTokenRepository.deleteRefreshToken(id);
    }
}
