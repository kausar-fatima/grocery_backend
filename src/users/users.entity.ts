import { Exclude } from 'class-transformer';
import { Cart } from 'src/cart/cart.entity';
import { UserRole } from 'src/common/enums/user_role.enum';
import { Order } from 'src/orders/orders.entity';
import { Store } from 'src/stores/stores.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    username!: string;

    @Column({unique: true})
    email!: string;

    @Exclude()
    @Column()
    password!: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CUSTOMER,
    })
    role!: UserRole;

    @Column()
    phone!: string;

    @Column({ default: false })
    isApproved!: boolean;

    @Column({ default: false })
    isSoftDeleted!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ nullable: true })
    verificationToken!: string;

    @OneToMany(() => Store, (store) => store.owner)
    stores!: Store[];

    @OneToOne(
        () => Cart,
        cart => cart.user,
    )
    cart!: Cart;

    @OneToMany(
        () => Order,
        order => order.user,
    )
    orders!: Order[];

    @Column({
        nullable: true,
    })
    passwordResetToken!: string;

    @Column({
        nullable: true,
    })
    passwordResetExpires!: Date;
}