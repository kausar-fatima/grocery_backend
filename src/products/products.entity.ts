import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    ManyToMany,
    CreateDateColumn,
    UpdateDateColumn,
    JoinTable,
    OneToMany,
} from 'typeorm';

import { Store } from '../stores/stores.entity';
import { Category } from '../categories/categories.entity';
import { CartItem } from 'src/cart-items/cart-item.entity';
import { OrderItem } from 'src/order-items/order-item.entity';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column('text')
    description!: string;

    @Column('decimal', {
        transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value),
        },
    })
    price!: number;

    @Column()
    stock!: number;

    @Column({ nullable: true })
    image!: string;

    @Column({ default: true })
    isAvailable!: boolean;

    @ManyToOne(
        () => Store,
        (store) => store.products,
        { onDelete: 'CASCADE' },
    )
    store!: Store;

    @ManyToOne(
        () => Category,
        (category) => category.products,
        { onDelete: 'CASCADE' },
    )
    category!: Category;

    @OneToMany(() => CartItem, item => item.product)
    cartItems!: CartItem[];

    @OneToMany(() => OrderItem, item => item.product)
    orderItems!: OrderItem[];


    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}