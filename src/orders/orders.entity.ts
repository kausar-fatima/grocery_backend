import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToOne,
    JoinColumn,
    Column,
    CreateDateColumn,
    OneToMany,
} from 'typeorm';

import { User } from '../users/users.entity';
import { OrderStatus } from 'src/common/enums/order_status.enum';
import { Payment } from 'src/payments/payments.entity';
import { OrderItem } from 'src/order-items/order-item.entity';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User)
    user!: User;

    @OneToMany(() => OrderItem, item => item.order, {
        cascade: true
    })
    items!: OrderItem[];

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.ACCEPTED,
    })
    status!: OrderStatus;

    @Column({
        type: 'decimal',
        default: 0,
    })
    totalAmount!: number;

    // Delivery details captured at checkout (nullable, added for the
    // customer app so orders can show a destination and be tracked).
    @Column({ nullable: true })
    address!: string;

    @Column({ nullable: true })
    shippingMethod!: string;

    @Column({
        type: 'decimal',
        default: 0,
    })
    deliveryFee!: number;

    // Promotional discount applied to the subtotal at checkout.
    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
    })
    discountAmount!: number;

    @Column({ type: 'varchar', nullable: true })
    promoTitle!: string | null;

    // --- Delivery / rider tracking ---
    @ManyToOne(() => User, { nullable: true, eager: false })
    @JoinColumn({ name: 'riderId' })
    rider!: User | null;

    @Column({ type: 'int', nullable: true })
    riderId!: number | null;

    // Live rider position, updated while the order is out for delivery.
    @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    riderLat!: number | null;

    @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    riderLng!: number | null;

    // Pickup (store) location, captured at order time.
    @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    storeLat!: number | null;

    @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    storeLng!: number | null;

    // Delivery destination (customer's chosen address).
    @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    destLat!: number | null;

    @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    destLng!: number | null;

    @Column({ type: 'timestamp', nullable: true })
    deliveredAt!: Date | null;

    @OneToOne(
        () => Payment,
        payment => payment.order,
        {
            cascade: true,
        },
    )
    @JoinColumn()
    payment!: Payment;

    @CreateDateColumn()
    createdAt!: Date;
}