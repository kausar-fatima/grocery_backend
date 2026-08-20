import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    CreateDateColumn,
} from 'typeorm';

import { Order } from '../orders/orders.entity';

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    method!: string;

    @Column({
        default: 'pending',
    })
    status!: string;

    @Column('decimal')
    amount!: number;

    @Column({
        default: 'USD',
    })
    currency!: string;

    @Column({
        nullable: true,
    })
    transactionId!: string;

    @Column({ nullable: true, unique: true })
    paymentIntentId!: string; // new — correlates webhook events back to this row

    @OneToOne(
        () => Order,
        order => order.payment,
    )
    order!: Order;

    @CreateDateColumn()
    createdAt!: Date;
}