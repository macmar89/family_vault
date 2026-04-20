import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class RefreshTokenRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createRefreshToken(userId: string, hashedToken: string,  expiresAt: Date, userAgent?: string,){
        await this.prisma.refreshToken.create({
            data: {
                token: hashedToken,
                userId,
                userAgent,
                expiresAt,
            }
        });
    }

    async deleteRefreshToken(id: string) {
        return this.prisma.refreshToken.delete({
            where: { id },
        });
    }

    async findByToken(token: string) {
        return this.prisma.refreshToken.findUnique({
            where: { token },
        });
    }

    async deleteExpiredTokens() {
        const now = new Date();
        return this.prisma.refreshToken.deleteMany({
            where: { expiresAt: { lt: now } },
        });
    }
}
