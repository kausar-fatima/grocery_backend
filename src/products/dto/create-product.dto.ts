import {
    IsString,
    IsNumber,
} from 'class-validator';

export class CreateProductDto {
    @IsString()
    name!: string;

    @IsString()
    description!: string;

    @IsNumber()
    price!: number;

    @IsNumber()
    stock!: number;

    @IsNumber()
    storeId!: number;

    @IsNumber()
    categoryId!: number;
}