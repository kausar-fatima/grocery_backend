import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

import { Order } from 'src/orders/orders.entity';
import { Product } from 'src/products/products.entity';

@Entity('order_items')
export class OrderItem {

    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Order, order => order.items, {
        onDelete: 'CASCADE',
    })
    order!: Order;

    @ManyToOne(() => Product, product => product.orderItems)
    product!: Product;

    @Column()
    quantity!: number;

    @Column('decimal', {
        precision: 10,
        scale: 2,
    })
    price!: number;

    @Column('decimal', {
        precision: 10,
        scale: 2,
    })
    subtotal!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}