import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Unique,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity('device_tokens')
@Unique(['token'])
export class DeviceToken {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: User;

    @Column()
    userId!: number;

    @Column()
    token!: string;

    @Column({ default: 'android' })
    platform!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}