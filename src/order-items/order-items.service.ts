import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { OrderItem } from './order-item.entity';
import { Order } from 'src/orders/orders.entity';
import { Product } from 'src/products/products.entity';

import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

@Injectable()
export class OrderItemsService {

    constructor(

        @InjectRepository(OrderItem)
        private repository: Repository<OrderItem>,

        @InjectRepository(Order)
        private orderRepository: Repository<Order>,

        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    async create(dto: CreateOrderItemDto) {

        const order = await this.orderRepository.findOne({
            where: { id: dto.orderId },
        });

        if (!order)
            throw new NotFoundException();

        const product = await this.productRepository.findOne({
            where: { id: dto.productId },
        });

        if (!product)
            throw new NotFoundException();

        const item = this.repository.create({

            order,

            product,

            quantity: dto.quantity,

            price: product.price,

            subtotal:
                Number(product.price) *
                dto.quantity,
        });

        return this.repository.save(item);
    }

    async findAll() {

        return this.repository.find({
            relations: [
                'order',
                'product',
            ],
        });
    }

    async findOne(id: number) {

        return this.repository.findOne({
            where: { id },
            relations: [
                'order',
                'product',
            ],
        });
    }

    async update(
        id: number,
        dto: UpdateOrderItemDto,
    ) {

        const item = await this.findOne(id);

        if (!item)
            throw new NotFoundException();

        item.quantity = dto.quantity;

        item.subtotal =
            Number(item.price) *
            dto.quantity;

        return this.repository.save(item);
    }

    async delete(id: number) {

        await this.repository.delete(id);

        return {
            message: 'Deleted',
        };
    }
}