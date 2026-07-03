import {
    IsString,
    IsNumber,
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
}