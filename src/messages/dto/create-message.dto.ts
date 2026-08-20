import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
    @IsInt()
    orderId!: number;

    @IsString()
    @IsNotEmpty()
    text!: string;
}
