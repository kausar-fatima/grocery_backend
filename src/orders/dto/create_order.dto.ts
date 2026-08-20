import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
    @IsInt()
    userId!: number;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    shippingMethod?: string;

    @IsOptional()
    @IsNumber()
    deliveryFee?: number;

    @IsOptional()
    @IsNumber()
    destLat?: number;

    @IsOptional()
    @IsNumber()
    destLng?: number;
}
