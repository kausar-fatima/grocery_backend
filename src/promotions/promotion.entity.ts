import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

/**
 * An admin-managed promotional discount. The newest [active] promotion drives
 * the customer home banner and is applied to the cart subtotal at checkout.
 */
@Entity('promotions')
export class Promotion {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column({ nullable: true })
    description!: string;

    // Percentage off the cart subtotal (0–100).
    @Column({ type: 'int', default: 0 })
    discountPercent!: number;

    @Column({ default: true })
    active!: boolean;

    // When true, only the customer's very first order qualifies.
    @Column({ default: false })
    firstOrderOnly!: boolean;

    // Minimum subtotal required for the discount to apply.
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    minSubtotal!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
