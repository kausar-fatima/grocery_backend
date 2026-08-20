import { IsInt, IsPositive } from 'class-validator';

export class CreatePaymentIntentDto {
    @IsInt()
    @IsPositive()
    orderId!: number;
}