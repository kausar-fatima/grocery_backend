import { IsInt, IsPositive } from 'class-validator';

export class CreateCodPaymentDto {
    @IsInt()
    @IsPositive()
    orderId!: number;
}