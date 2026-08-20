import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';

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

    // Geo-coordinates so the customer app can rank stores by distance.
    @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    latitude!: number | null;

    @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    longitude!: number | null;

    @Column({ default: true })
    isActive!: boolean;

    // Opening hours as "HH:mm" (24h). Null on both → always open.
    @Column({ type: 'varchar', nullable: true })
    opensAt!: string | null;

    @Column({ type: 'varchar', nullable: true })
    closesAt!: string | null;

    /** Whether the store is currently open (server local time). Serialized
     *  into responses so the customer app can show open/closed and block
     *  ordering from a closed store. */
    @Expose()
    get isOpen(): boolean {
        return Store.computeOpen(this.opensAt, this.closesAt);
    }

    static computeOpen(
        opensAt?: string | null,
        closesAt?: string | null,
    ): boolean {
        if (!opensAt || !closesAt) return true; // no hours set → always open
        const [oh, om] = opensAt.split(':').map(Number);
        const [ch, cm] = closesAt.split(':').map(Number);
        if ([oh, om, ch, cm].some((n) => Number.isNaN(n))) return true;
        const now = new Date();
        const cur = now.getHours() * 60 + now.getMinutes();
        const open = oh * 60 + om;
        const close = ch * 60 + cm;
        // Overnight span (e.g. 20:00–02:00) wraps past midnight.
        return close > open
            ? cur >= open && cur < close
            : cur >= open || cur < close;
    }

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