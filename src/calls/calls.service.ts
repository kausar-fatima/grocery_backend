import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Call } from './call.entity';
import { CreateCallDto } from './dto/create-call.dto';
import { CallStatus } from '../common/enums/call_status.enum';

@Injectable()
export class CallsService {
    constructor(
        @InjectRepository(Call)
        private callRepository: Repository<Call>,
    ) {}

    async initiate(callerId: number, dto: CreateCallDto) {
        const call = this.callRepository.create({
            callerId,
            calleeId: dto.calleeId,
            orderId: dto.orderId ?? null,
            status: CallStatus.RINGING,
        });
        return this.callRepository.save(call);
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

    answer(id: number) {
        return this.setStatus(id, CallStatus.ACCEPTED);
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
