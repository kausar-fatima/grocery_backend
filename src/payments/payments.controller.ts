import {
    BadRequestException,
    Body,
    Controller,
    Headers,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';

import { PaymentsService } from './payments.service';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { CreateCodPaymentDto } from './dto/create-cod-payment.dto';

@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly paymentsService:
            PaymentsService,
    ) { }

    @Post('create-intent')
    createIntent(@Body() dto: CreatePaymentIntentDto) {
        return this.paymentsService.createPaymentIntent(dto);
    }

    @Post('webhook')
    handleWebhook(
        @Req() req: RawBodyRequest<Request>,
        @Headers('stripe-signature') signature: string,
    ) {
        if (!signature) {
            throw new BadRequestException('Missing stripe-signature header');
        }
        return this.paymentsService.handleStripeWebhook(req.rawBody!, signature);
    }

    @Post('cod')
    createCod(@Body() dto: CreateCodPaymentDto) {
        return this.paymentsService.createCashOnDelivery(dto);
    }

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