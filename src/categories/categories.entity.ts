import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

import { Store } from 'src/stores/stores.entity';
import { Product } from 'src/products/products.entity';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({
        nullable: true,
    })
    image!: string;

    @Column({
        default: true,
    })
    isActive!: boolean;

    @ManyToOne(
        () => Store,
        (store) => store.categories,
        {
            onDelete: 'CASCADE',
        },
    )
    store!: Store;

    @OneToMany(
        () => Product,
        (product) => product.category,
    )
    products!: Product[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}