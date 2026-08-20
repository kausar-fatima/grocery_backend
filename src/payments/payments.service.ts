import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Payment } from './payments.entity';
import { Order } from '../orders/orders.entity';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import Stripe from 'stripe';
import { CreateCodPaymentDto } from './dto/create-cod-payment.dto';

@Injectable()
export class PaymentsService {
    private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    constructor(
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,

        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
    ) { }

    /** Stripe flow: create a PaymentIntent for an order, store it as 'pending'. */
    async createPaymentIntent(dto: CreatePaymentIntentDto) {
        const order = await this.orderRepository.findOne({
            where: { id: dto.orderId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // order.totalAmount is a decimal column -> comes back as a string.
        // Convert, then round, to avoid float drift (19.99 * 100 !== 1999 in JS).
        const amountInCents = Math.round(Number(order.totalAmount) * 100);

        const intent = await this.stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
            metadata: { orderId: String(order.id) },
        });

        const payment = this.paymentRepository.create({
            method: 'stripe',
            status: 'pending',
            amount: order.totalAmount,
            currency: 'usd',
            paymentIntentId: intent.id,
            order,
        });
        await this.paymentRepository.save(payment);

        return { clientSecret: intent.client_secret };
    }

    /** Verifies the Stripe signature, then updates the matching Payment row. */
    async handleStripeWebhook(rawBody: Buffer, signature: string) {
        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(
                rawBody,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET!,
            );
        } catch (err) {
            throw new BadRequestException(
                `Webhook signature verification failed: ${(err as Error).message}`,
            );
        }

        switch (event.type) {
            case 'payment_intent.succeeded': {
                const intent = event.data.object as Stripe.PaymentIntent;
                await this.resolveByIntent(intent.id, 'completed', intent.id);
                break;
            }
            case 'payment_intent.payment_failed': {
                const intent = event.data.object as Stripe.PaymentIntent;
                await this.resolveByIntent(intent.id, 'failed');
                break;
            }
            default:
                break; // other event types are ignored
        }

        return { received: true };
    }

    private async resolveByIntent(
        paymentIntentId: string,
        status: string,
        transactionId?: string,
    ) {
        const payment = await this.paymentRepository.findOne({
            where: { paymentIntentId },
        });

        if (!payment) return; // event for something we don't have a row for

        payment.status = status;
        if (transactionId) payment.transactionId = transactionId;

        await this.paymentRepository.save(payment);
    }

    async createCashOnDelivery(dto: CreateCodPaymentDto) {
        const order = await this.orderRepository.findOne({
            where: { id: dto.orderId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        const payment = this.paymentRepository.create({
            method: 'cod',
            status: 'pending', // flips to 'completed' via updateStatus once cash is collected
            amount: order.totalAmount,
            currency: 'usd',
            order,
        });

        return await this.paymentRepository.save(payment);
    }

    async create(
        dto: CreatePaymentDto,
    ) {
        const order =
            await this.orderRepository.findOne({
                where: {
                    id: dto.orderId,
                },
            });

        if (!order) {
            throw new NotFoundException(
                'Order not found',
            );
        }

        const payment =
            this.paymentRepository.create({
                method: dto.method,
                transactionId:
                    dto.transactionId,
                amount: order.totalAmount,
                status: 'completed',
                order,
            });

        return await this.paymentRepository.save(
            payment,
        );
    }

    async findAll() {
        return await this.paymentRepository.find({
            relations: ['order'],
        });
    }

    async findOne(id: number) {
        return await this.paymentRepository.findOne({
            where: { id },
            relations: ['order'],
        });
    }

    async updateStatus(
        id: number,
        status: string,
    ) {
        const payment =
            await this.paymentRepository.findOne({
                where: { id },
            });

        if (!payment) {
            throw new NotFoundException(
                'Payment not found',
            );
        }

        payment.status = status;

        return await this.paymentRepository.save(
            payment,
        );
    }

    async remove(id: number) {
        await this.paymentRepository.delete(id);

        return {
            message:
                'Payment deleted successfully',
        };
    }
}