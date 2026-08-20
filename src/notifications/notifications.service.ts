import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

export interface NotificationPayload {
    title: string;
    body: string;
    type?: string;
    orderId?: number | null;
}

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private repo: Repository<Notification>,
    ) {}

    /** Creates a notification. Never throws — notification failures must not
     *  break the flow that triggered them. */
    async create(userId: number, payload: NotificationPayload): Promise<void> {
        try {
            const n = this.repo.create({
                userId,
                title: payload.title,
                body: payload.body,
                type: payload.type ?? 'general',
                orderId: payload.orderId ?? null,
            });
            await this.repo.save(n);
        } catch {
            // swallow — best effort
        }
    }

    async createMany(userIds: number[], payload: NotificationPayload) {
        for (const id of userIds) {
            await this.create(id, payload);
        }
    }

    forUser(userId: number) {
        return this.repo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 100,
        });
    }

    async unread(userId: number) {
        const count = await this.repo.count({
            where: { userId, isRead: false },
        });
        return { unread: count };
    }

    async markRead(id: number) {
        await this.repo.update({ id }, { isRead: true });
        return { message: 'Marked as read' };
    }

    async markAllRead(userId: number) {
        await this.repo.update({ userId, isRead: false }, { isRead: true });
        return { message: 'All marked as read' };
    }

    async remove(id: number) {
        await this.repo.delete(id);
        return { message: 'Deleted' };
    }
}
