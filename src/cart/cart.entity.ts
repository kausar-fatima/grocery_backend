import {
    Entity,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';

import { User } from '../users/users.entity';
import { CartItem } from 'src/cart-items/cart-item.entity';

@Entity('carts')
export class Cart {
    @PrimaryGeneratedColumn()
    id!: number;

    @OneToOne(() => User)
    @JoinColumn()
    user!: User;

    @OneToMany(() => CartItem, item => item.cart, {
        cascade: true
    })
    items!: CartItem[];
    
    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}