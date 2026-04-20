import { IsEmail, IsString , IsOptional, MaxLength, MinLength} from "class-validator";

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(12)
    password: string;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    name?: string;
}
