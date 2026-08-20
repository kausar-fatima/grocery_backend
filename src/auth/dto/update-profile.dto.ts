import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @MinLength(6)
    password?: string;
}
