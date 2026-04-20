import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma, UserRole } from "@prisma/client";

@Injectable()
export class UsersRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createInitialUser(user: Prisma.UserCreateInput) {
        const {email, password, name} = user;
        return this.prisma.user.create({
            data: {
                email,
                password,
                name,
                tokenVersion:1,
                role: UserRole.OWNER,
            },
        });
    }

    async countUsers() {
        return this.prisma.user.count();
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
            where: { id },
        });
    }
}