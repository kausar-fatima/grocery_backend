import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    JoinColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { CallStatus } from '../common/enums/call_status.enum';

/// A call-signaling record. There is no live audio (see architecture note);
/// this drives the in-app ringing/accept/decline UI and call history.
@Entity('calls')
export class Call {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'callerId' })
    caller!: User;

    @Column()
    callerId!: number;

    @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'calleeId' })
    callee!: User;

    @Column()
    calleeId!: number;

    @Column({ type: 'int', nullable: true })
    orderId!: number | null;

    @Column({ unique: true })
    channelName!: string;

    @Column({
        type: 'enum',
        enum: CallStatus,
        default: CallStatus.RINGING,
    })
    status!: CallStatus;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ type: 'timestamp', nullable: true })
    endedAt!: Date | null;
}
