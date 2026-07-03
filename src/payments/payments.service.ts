import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Payment } from './payments.entity';
import { Order } from '../orders/orders.entity';

import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,

        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
    ) { }

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