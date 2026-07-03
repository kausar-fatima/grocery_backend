import { IsDate, IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { UserRole } from 'src/common/enums/user_role.enum';

export class RegisterDto {
    @IsNotEmpty()
    username!: string;

    @IsEmail()
    email!: string;

    @MinLength(6)
    password!: string;

    @IsNotEmpty()
    phone!: string;

    @IsEnum(UserRole)
    role!: UserRole;
}