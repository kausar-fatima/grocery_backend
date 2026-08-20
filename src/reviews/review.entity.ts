import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    JoinColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Product } from '../products/products.entity';
import { Order } from '../orders/orders.entity';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: User;

    @Column()
    userId!: number;

    @ManyToOne(() => Product, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId' })
    product!: Product | null;

    @Column({ type: 'int', nullable: true })
    productId!: number | null;

    @ManyToOne(() => Order, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'orderId' })
    order!: Order | null;

    @Column({ type: 'int', nullable: true })
    orderId!: number | null;

    @Column({ type: 'int' })
    rating!: number;

    @Column({ type: 'text', nullable: true })
    comment!: string;

    @CreateDateColumn()
    createdAt!: Date;
}
