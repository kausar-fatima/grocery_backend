import {
    IsInt,
    ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

class CartProductDto {

    @IsInt()
    productId!: number;

    @IsInt()
    quantity!: number;

}

export class CreateCartDto {

    @IsInt()
    userId!: number;

    @ValidateNested({ each: true })
    @Type(() => CartProductDto)
    items!: CartProductDto[];

}