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

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id!: number;

    @Index()
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: User;

    @Column()
    userId!: number;

    @Column()
    title!: string;

    @Column('text')
    body!: string;

    /** general | order | status | rider | approval | promo */
    @Column({ default: 'general' })
    type!: string;

    @Column({ default: false })
    isRead!: boolean;

    @Column({ type: 'int', nullable: true })
    orderId!: number | null;

    @CreateDateColumn()
    createdAt!: Date;
}
