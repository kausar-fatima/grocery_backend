import {
    IsNumber,
    IsString,
} from 'class-validator';

export class CreatePaymentDto {
    @IsNumber()
    orderId!: number;

    @IsString()
    method!: string;

    @IsString()
    transactionId!: string;
}