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