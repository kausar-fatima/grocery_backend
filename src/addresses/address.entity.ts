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

@Entity('addresses')
export class Address {
    @PrimaryGeneratedColumn()
    id!: number;

    @Index()
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: User;

    @Column()
    userId!: number;

    @Column()
    label!: string;

    @Column()
    street!: string;

    @Column({ nullable: true })
    city!: string;

    @Column({ nullable: true })
    state!: string;

    @Column({ nullable: true })
    zip!: string;

    @Column({ nullable: true })
    phone!: string;

    @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    latitude!: number | null;

    @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    longitude!: number | null;

    @Column({ default: false })
    isDefault!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
}
