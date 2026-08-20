import {
    IsBoolean,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class UpdateAddressDto {
    @IsOptional()
    @IsString()
    label?: string;

    @IsOptional()
    @IsString()
    street?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    state?: string;

    @IsOptional()
    @IsString()
    zip?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsNumber()
    latitude?: number;

    @IsOptional()
    @IsNumber()
    longitude?: number;

    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}
