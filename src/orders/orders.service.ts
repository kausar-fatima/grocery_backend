import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { Repository } from 'typeorm';

import { User } from '../users/users.entity';
import { Order } from './orders.entity';
import { OrderItem } from '../order-items/order-item.entity';

import { OrderStatus } from '../common/enums/order_status.enum';
import { Cart } from 'src/cart/cart.entity';
import { CartItem } from 'src/cart-items/cart-item.entity';
import { CreateOrderDto } from './dto/create_order.dto';

@Injectable()
export class OrdersService {

    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,

        private dataSource: DataSource,
    ) { }

    async create(dto: CreateOrderDto) {

        return this.dataSource.transaction(async manager => {

            const user = await manager.findOne(User, {
                where: {
                    id: dto.userId,
                }
            });

            if (!user) {
                throw new NotFoundException("User not found");
            }

            const cart = await manager.findOne(Cart, {
                where: {
                    user: {
                        id: user.id,
                    }
                }
            });

            if (!cart) {
                throw new BadRequestException(
                    "Cart not found"
                );
            }

            const cartItems = await manager.find(CartItem, {
                where: {
                    cart: {
                        id: cart.id,
                    }
                },
                relations: [
                    "product",
                ]
            });

            if (cartItems.length === 0) {
                throw new BadRequestException(
                    "Cart is empty"
                );
            }

            const order = manager.create(Order, {
                user,
                status: OrderStatus.ACCEPTED,
            });

            await manager.save(order);

            let total = 0;

            for (const cartItem of cartItems) {
                const product = cartItem.product;
                if (product.stock < cartItem.quantity) {

                    throw new BadRequestException(
                        `${product.name} stock unavailable`
                    );

                }
                product.stock -= cartItem.quantity;

                await manager.save(product);

                const subtotal =
                    Number(product.price) *
                    cartItem.quantity;

                total += subtotal;

                const orderItem = manager.create(OrderItem, {
                    order,
                    product,
                    quantity: cartItem.quantity,
                    price: Number(product.price),
                    subtotal,
                });
                await manager.save(orderItem);
            }
            order.totalAmount = total

            await manager.save(order);

            await manager.delete(CartItem, {
                cart: {
                    id: cart.id,
                }
            });

            return manager.findOne(Order, {
                where: {
                    id: order.id,
                },
                relations: [
                    "user",
                    "items",
                    "items.product",
                ]
            });

        });

    }

    async findAll() {

        return await this.orderRepository.find({

            relations: [
                "user",
                "items",
                "items.product",
                "payment",
            ],

            order: {
                createdAt: "DESC",
            }

        });

    }
    async findOne(id: number) {

        const order =
            await this.orderRepository.findOne({

                where: {
                    id,
                },

                relations: [
                    "user",
                    "items",
                    "items.product",
                    "payment",
                ],

            });

        if (!order) {

            throw new NotFoundException(
                "Order not found"
            );

        }

        return order;

    }
    async delete(id: number) {

        const order =
            await this.orderRepository.findOne({

                where: {
                    id,
                }

            });

        if (!order) {

            throw new NotFoundException(
                "Order not found"
            );

        }

        await this.orderRepository.remove(order);

        return {

            message: "Order deleted"

        };

    }
    async updateStatus(
        id: number,
        status: OrderStatus,
    ) {

        return this.dataSource.transaction(async manager => {

            const order =
                await manager.findOne(Order, {

                    where: {
                        id,
                    },

                    relations: [
                        "items",
                        "items.product",
                    ],

                });

            if (!order) {

                throw new NotFoundException(
                    "Order not found"
                );

            }

            if (
                status === OrderStatus.CANCELLED &&
                order.status !== OrderStatus.CANCELLED
            ) {

                for (const item of order.items) {

                    item.product.stock += item.quantity;

                    await manager.save(item.product);

                }

            }

            order.status = status;

            await manager.save(order);

            return order;

        });

    }
}