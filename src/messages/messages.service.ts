import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Message } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { Order } from '../orders/orders.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        private readonly notifications: NotificationsService,
    ) { }

    async send(senderId: number, dto: CreateMessageDto) {
        const message = this.messageRepository.create({
            orderId: dto.orderId,
            senderId,
            text: dto.text,
        });
        const saved = await this.messageRepository.save(message);

        // Re-fetch with the eager `sender` relation populated (the entity
        // returned by .save() only has senderId, not the loaded User).
        const full = await this.messageRepository.findOne({
            where: { id: saved.id },
        });
        if (full) {
            await this.notifyRecipient(full);
        }

        return saved;
    }

    /**
     * Pushes a notification to whichever party (customer or rider) on this
     * order did NOT send the message. Never throws — a push failure must
     * not block the message from being saved/returned.
     *
     * NOTE: adjust `order.customerId` / `order.riderId` below if your Order
     * entity uses different field names for these two relations.
     */
    private async notifyRecipient(message: Message) {
        try {
            const order = await this.orderRepository.findOne({
                where: { id: message.orderId },
            });
            if (!order) return;

            const recipientId =
                message.senderId === order.user.id
                    ? order.riderId
                    : order.user.id;
            if (!recipientId) return; // e.g. no rider assigned yet

            const senderName = message.sender?.username ?? 'Someone';
            const preview =
                message.text.length > 80
                    ? `${message.text.slice(0, 80)}…`
                    : message.text;

            await this.notifications.pushToUser(recipientId, {
                title: senderName,
                body: preview,
                data: {
                    type: 'chat',
                    orderId: String(message.orderId),
                    senderId: String(message.senderId),
                    senderName,
                },
            });
        } catch {
            // best effort — chat still works even if push fails
        }
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