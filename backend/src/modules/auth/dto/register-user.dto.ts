import { IsEmail, IsString, IsOptional, MaxLength, MinLength, IsEnum } from "class-validator";
import { UserRole } from "@prisma/client";

export class RegisterUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(12)
    password: string;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    name?: string;

    @IsEnum(UserRole)
    role: UserRole;
}
