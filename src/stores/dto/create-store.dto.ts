import {
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateStoreDto {
    @IsString()
    name!: string;

    @IsString()
    address!: string;

    @IsString()
    phone!: string;

    @IsNumber()
    ownerId!: number;

    @IsOptional()
    @IsNumber()
    latitude?: number;

    @IsOptional()
    @IsNumber()
    longitude?: number;

    @IsOptional()
    @IsString()
    opensAt?: string;

    @IsOptional()
    @IsString()
    closesAt?: string;
}
