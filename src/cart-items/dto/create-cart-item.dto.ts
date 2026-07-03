import { IsInt, Min } from 'class-validator';

export class CreateCartItemDto {

    @IsInt()
    cartId!: number;

    @IsInt()
    productId!: number;

    @IsInt()
    @Min(1)
    quantity!: number;
}