import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

import { User } from 'src/users/users.entity';
import { Category } from 'src/categories/categories.entity';
import { Product } from 'src/products/products.entity';

@Entity('stores')
export class Store {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    address!: string;

    @Column()
    phone!: string;

    @Column({ nullable: true })
    image!: string;

    @Column({ default: true })
    isActive!: boolean;

    @ManyToOne(
        () => User,
        (user) => user.stores,
    )
    owner!: User;

    @OneToMany(
        () => Category,
        (category) => category.store,
    )
    categories!: Category[];

    @OneToMany(
        () => Product,
        (product) => product.store,
    )
    products!: Product[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}