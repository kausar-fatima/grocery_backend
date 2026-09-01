import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Call } from './call.entity';
import { CreateCallDto } from './dto/create-call.dto';
import { CallStatus } from '../common/enums/call_status.enum';
import { AgoraTokenService } from './agora-token.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class CallsService {
    constructor(
        @InjectRepository(Call)
        private callRepository: Repository<Call>,
        private readonly agoraToken: AgoraTokenService,
        private readonly notifications: NotificationsService,
    ) { }

    /**
     * Creates the call record, generates a unique Agora channel, and
     * returns the caller's own join token so the caller's client can enter
     * the channel immediately (before the callee has even answered).
     */
    async initiate(callerId: number, dto: CreateCallDto) {
        const channelName = `call_${randomUUID()}`;

        const call = this.callRepository.create({
            callerId,
            calleeId: dto.calleeId,
            orderId: dto.orderId ?? null,
            channelName,
            status: CallStatus.RINGING,
        });
        const saved = await this.callRepository.save(call);

        const callerToken = this.agoraToken.generateRtcToken(
            channelName,
            callerId,
        );

        // Wake the callee's app to show the native ringing screen.
        await this.notifications.pushDataOnly(dto.calleeId, {
            type: 'incoming_call',
            callId: String(saved.id),
            channelName,
            callerId: String(callerId),
            callerName: saved.caller?.username ?? 'Unknown', // adjust to your User field
            orderId: dto.orderId ? String(dto.orderId) : '',
        });

        return {
            call: saved,
            channelName,
            token: callerToken,
        };
    }

    /** Ringing calls addressed to the user — polled to show incoming calls. */
    incoming(userId: number) {
        return this.callRepository.find({
            where: { calleeId: userId, status: CallStatus.RINGING },
            order: { createdAt: 'DESC' },
        });
    }

    findOne(id: number) {
        return this.callRepository.findOne({ where: { id } });
    }

    async setStatus(id: number, status: CallStatus) {
        const call = await this.callRepository.findOne({ where: { id } });
        if (!call) throw new NotFoundException('Call not found');
        call.status = status;
        if (status === CallStatus.ENDED || status === CallStatus.DECLINED) {
            call.endedAt = new Date();
        }
        return this.callRepository.save(call);
    }

    /**
     * Callee accepts: marks the call accepted and returns the callee's own
     * Agora token so their client can join the same channel the caller is
     * already in.
     */
    async answer(id: number, calleeUserId: number) {
        const call = await this.callRepository.findOne({ where: { id } });
        if (!call) throw new NotFoundException('Call not found');

        call.status = CallStatus.ACCEPTED;
        await this.callRepository.save(call);

        const calleeToken = this.agoraToken.generateRtcToken(
            call.channelName,
            calleeUserId,
        );

        return {
            call,
            channelName: call.channelName,
            token: calleeToken,
        };
    }

    decline(id: number) {
        return this.setStatus(id, CallStatus.DECLINED);
    }

    end(id: number) {
        return this.setStatus(id, CallStatus.ENDED);
    }

    history(userId: number) {
        return this.callRepository
            .createQueryBuilder('call')
            .leftJoinAndSelect('call.caller', 'caller')
            .leftJoinAndSelect('call.callee', 'callee')
            .where('call.callerId = :userId OR call.calleeId = :userId', {
                userId,
            })
            .orderBy('call.createdAt', 'DESC')
            .getMany();
    }
}