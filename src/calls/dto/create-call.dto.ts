import { IsInt, IsOptional } from 'class-validator';

export class CreateCallDto {
    @IsInt()
    calleeId!: number;

    @IsOptional()
    @IsInt()
    orderId?: number;
}
