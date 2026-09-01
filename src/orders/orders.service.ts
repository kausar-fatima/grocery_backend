import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, IsNull } from 'typeorm';

import { Repository } from 'typeorm';

import { User } from '../users/users.entity';
import { Order } from './orders.entity';
import { OrderItem } from '../order-items/order-item.entity';

import { OrderStatus } from '../common/enums/order_status.enum';
import { Cart } from 'src/cart/cart.entity';
import { CartItem } from 'src/cart-items/cart-item.entity';
import { CreateOrderDto } from './dto/create_order.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Store } from 'src/stores/stores.entity';
import { PromotionsService } from 'src/promotions/promotions.service';
import { DeliverySimulationService } from './delivery-simulation.service';

@Injectable()
export class OrdersService {

    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,

        private dataSource: DataSource,

        private notifications: NotificationsService,

        private promotions: PromotionsService,

        private simulation: DeliverySimulationService,
    ) { }

    /** Road route (store → destination) the rider follows, for the map. */
    getRoute(orderId: number) {
        return this.simulation.getRoute(orderId);
    }

    async create(dto: CreateOrderDto) {

        let storeOwnerId: number | null = null;

        // Determine the active promotion for this user up-front (before the new
        // order exists, so `firstOrderOnly` sees the correct prior count).
        const promo = await this.promotions.activeForUser(dto.userId);

        const order = await this.dataSource.transaction(async manager => {

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
                    "product.store",
                    "product.store.owner",
                ]
            });

            if (cartItems.length === 0) {
                throw new BadRequestException(
                    "Cart is empty"
                );
            }

            const store = cartItems[0]?.product?.store;
            storeOwnerId = store?.owner?.id ?? null;

            // Block ordering from a store that is currently closed.
            if (
                store &&
                !Store.computeOpen(store.opensAt, store.closesAt)
            ) {
                const hours =
                    store.opensAt && store.closesAt
                        ? ` (open ${store.opensAt}–${store.closesAt})`
                        : '';
                throw new BadRequestException(
                    `${store.name} is currently closed${hours}.`,
                );
            }

            const order = manager.create(Order, {
                user,
                status: OrderStatus.ACCEPTED,
                address: dto.address,
                shippingMethod: dto.shippingMethod,
                deliveryFee: dto.deliveryFee ?? 0,
                storeLat: store?.latitude ?? null,
                storeLng: store?.longitude ?? null,
                destLat: dto.destLat ?? null,
                destLng: dto.destLng ?? null,
            });

            await manager.save(order);

            let total = 0;

            for (const cartItem of cartItems) {
                const product = cartItem.product;
                if (product.isAvailable === false) {

                    throw new BadRequestException(
                        `${product.name} is currently unavailable`
                    );

                }
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
            // Apply the promotional discount to the item subtotal.
            const discount = this.promotions.computeDiscount(total, promo);
            order.discountAmount = discount;
            order.promoTitle = discount > 0 ? (promo?.title ?? null) : null;
            order.totalAmount =
                Math.max(0, total - discount) + Number(dto.deliveryFee ?? 0);

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

        if (order) {
            await this.notifications.create(order.user.id, {
                title: 'Order placed 🎉',
                body: `Your order #${order.id} has been placed successfully. We'll notify you as it progresses.`,
                type: 'order',
                orderId: order.id,
            });
            if (storeOwnerId) {
                await this.notifications.create(storeOwnerId, {
                    title: 'New order received 🛒',
                    body: `You have a new order #${order.id} to prepare.`,
                    type: 'order',
                    orderId: order.id,
                });
            }
        }

        return order;

    }

    async findAll() {

        return await this.orderRepository.find({

            relations: [
                "user",
                "items",
                "items.product",
                "payment",
                "rider",
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
                    "rider",
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
                        "user",
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

            if (status === OrderStatus.DELIVERED) {
                order.deliveredAt = new Date();
            }

            await manager.save(order);

            return order;

        }).then(async (order) => {
            // Drive/stop the live rider simulation as the order moves.
            if (order.status === OrderStatus.ON_THE_WAY) {
                await this.simulation.start(order.id);
            } else if (
                order.status === OrderStatus.DELIVERED ||
                order.status === OrderStatus.CANCELLED
            ) {
                this.simulation.stop(order.id);
            }
            await this.notifications.create(order.user.id, {
                title: 'Order update',
                body: `Your order #${order.id} is now "${this.statusLabel(order.status)}".`,
                type: 'status',
                orderId: order.id,
            });
            return order;
        });

    }

    private statusLabel(status: OrderStatus): string {
        switch (status) {
            case OrderStatus.ACCEPTED: return 'Accepted';
            case OrderStatus.PREPARING: return 'Preparing';
            case OrderStatus.READY: return 'Ready for pickup';
            case OrderStatus.PICKED_UP: return 'Picked up';
            case OrderStatus.ON_THE_WAY: return 'On the way';
            case OrderStatus.DELIVERED: return 'Delivered';
            case OrderStatus.CANCELLED: return 'Cancelled';
            default: return status;
        }
    }

    // --- Customer scoped ---
    async findForUser(userId: number) {
        return this.orderRepository.find({
            where: { user: { id: userId } },
            relations: ['items', 'items.product', 'payment', 'rider'],
            order: { createdAt: 'DESC' },
        });
    }

    // --- Rider flows ---

    /** Orders a store marked READY and that no rider has claimed. When the
     *  rider's location is provided, only orders whose pickup (store) is
     *  within [radiusKm] are returned, nearest first — so a rider only sees
     *  jobs near them. */
    async availableForRider(lat?: number, lng?: number, radiusKm = 15) {
        const orders = await this.orderRepository.find({
            where: { status: OrderStatus.READY, riderId: IsNull() },
            relations: ['user', 'items', 'items.product'],
            order: { createdAt: 'ASC' },
        });

        if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
            return orders;
        }

        return orders
            .filter((o) => o.storeLat != null && o.storeLng != null)
            .map((o) => ({
                order: o,
                distance: this.distanceKm(
                    lat,
                    lng,
                    Number(o.storeLat),
                    Number(o.storeLng),
                ),
            }))
            .filter((x) => x.distance <= radiusKm)
            .sort((a, b) => a.distance - b.distance)
            .map((x) => x.order);
    }

    private distanceKm(
        lat1: number,
        lng1: number,
        lat2: number,
        lng2: number,
    ): number {
        const R = 6371;
        const toRad = (d: number) => (d * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    async findForRider(riderId: number) {
        return this.orderRepository.find({
            where: { riderId },
            relations: ['user', 'items', 'items.product', 'payment'],
            order: { createdAt: 'DESC' },
        });
    }

    async assignRider(orderId: number, riderId: number) {
        return this.dataSource.transaction(async (manager) => {
            // Atomically claim the order.
            const result = await manager
                .createQueryBuilder()
                .update(Order)
                .set({
                    riderId,
                    status: OrderStatus.PICKED_UP,
                })
                .where('id = :orderId', { orderId })
                .andWhere('riderId IS NULL')
                .andWhere('status = :status', {
                    status: OrderStatus.READY,
                })
                .execute();

            // Nobody got the order, or it was no longer available.
            if (result.affected !== 1) {
                throw new BadRequestException(
                    'Order is no longer available for pickup.',
                );
            }

            // Fetch the newly assigned order.
            const full = await manager.findOne(Order, {
                where: { id: orderId },
                relations: [
                    'user',
                    'items',
                    'items.product',
                    'rider',
                ],
            });

            if (!full) {
                throw new NotFoundException('Order not found');
            }

            // Notify customer.
            if (full.user?.id) {
                await this.notifications.create(full.user.id, {
                    title: 'A rider is on the way 🛵',
                    body: `A rider has picked up your order #${orderId}.`,
                    type: 'rider',
                    orderId,
                });
            }

            // Notify rider.
            await this.notifications.create(riderId, {
                title: 'Delivery assigned',
                body: `You accepted order #${orderId}. Head to the store for pickup.`,
                type: 'rider',
                orderId,
            });

            return full;
        });
    }

    async updateLocation(orderId: number, lat: number, lng: number) {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
        });
        if (!order) throw new NotFoundException('Order not found');
        order.riderLat = lat;
        order.riderLng = lng;
        await this.orderRepository.save(order);
        return { message: 'Location updated', riderLat: lat, riderLng: lng };
    }
}