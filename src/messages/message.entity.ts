import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    JoinColumn,
    Index,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Order } from '../orders/orders.entity';

/// A chat message scoped to an order (customer <-> rider conversation).
@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn()
    id!: number;

    @Index()
    @ManyToOne(() => Order, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'orderId' })
    order!: Order;

    @Column()
    orderId!: number;

    @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'senderId' })
    sender!: User;

    @Column()
    senderId!: number;

    @Column('text')
    text!: string;

    @Column({ default: false })
    isRead!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
}
