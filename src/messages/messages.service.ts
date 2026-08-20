import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Message } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
    ) {}

    async send(senderId: number, dto: CreateMessageDto) {
        const message = this.messageRepository.create({
            orderId: dto.orderId,
            senderId,
            text: dto.text,
        });
        return this.messageRepository.save(message);
    }

    /** All messages for an order, oldest first (polled by both parties). */
    findForOrder(orderId: number) {
        return this.messageRepository.find({
            where: { orderId },
            order: { createdAt: 'ASC' },
        });
    }

    /** Marks the other party's messages in this order as read. */
    async markRead(orderId: number, userId: number) {
        await this.messageRepository.update(
            { orderId, senderId: Not(userId), isRead: false },
            { isRead: true },
        );
        return { message: 'Marked as read' };
    }

    /** Count of unread messages addressed to the user across all orders. */
    async unreadCount(userId: number) {
        const count = await this.messageRepository.count({
            where: { senderId: Not(userId), isRead: false },
        });
        return { unread: count };
    }
}
