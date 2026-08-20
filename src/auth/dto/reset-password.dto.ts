import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class ResetPasswordDto {

    @IsEmail()
    email!: string;

    // The 6-digit code delivered by forgot-password.
    @IsString()
    @Length(6, 6)
    code!: string;

    @MinLength(6)
    password!: string;

}
