import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from '@nestjs/common';

import { PaymentsService } from './payments.service';

import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly paymentsService:
            PaymentsService,
    ) { }

    @Post()
    create(
        @Body()
        dto: CreatePaymentDto,
    ) {
        return this.paymentsService.create(
            dto,
        );
    }

    @Get()
    findAll() {
        return this.paymentsService.findAll();
    }

    @Get(':id')
    findOne(
        @Param('id')
        id: string,
    ) {
        return this.paymentsService.findOne(
            +id,
        );
    }

    @Patch(':id/:status')
    updateStatus(
        @Param('id')
        id: string,
        @Param('status')
        status: string,
    ) {
        return this.paymentsService.updateStatus(
            +id,
            status,
        );
    }

    @Delete(':id')
    remove(
        @Param('id')
        id: string,
    ) {
        return this.paymentsService.remove(
            +id,
        );
    }
}