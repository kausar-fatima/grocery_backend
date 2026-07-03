import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

import { Cart } from 'src/cart/cart.entity';
import { Product } from 'src/products/products.entity';

@Entity('cart_items')
export class CartItem {

    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Cart, cart => cart.items, {
        onDelete: 'CASCADE',
    })
    cart!: Cart;

    @ManyToOne(() => Product, product => product.cartItems)
    product!: Product;

    @Column()
    quantity!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}