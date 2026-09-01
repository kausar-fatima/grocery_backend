import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { DeviceToken } from './device-token.entity';
import { FirebaseService } from '../firebase/firebase.service';

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
        @InjectRepository(DeviceToken)
        private deviceTokens: Repository<DeviceToken>,
        private readonly firebase: FirebaseService,
    ) { }

    /** Creates the in-app row AND pushes it to the user's device(s). Never
     *  throws — notification failures must not break the flow that
     *  triggered them. */
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

            await this.pushToUser(userId, {
                title: payload.title,
                body: payload.body,
                data: {
                    type: payload.type ?? 'general',
                    orderId: payload.orderId ? String(payload.orderId) : '',
                },
            });
        } catch {
            // swallow — best effort
        }
    }

    async createMany(userIds: number[], payload: NotificationPayload) {
        for (const id of userIds) {
            await this.create(id, payload);
        }
    }

    async registerDeviceToken(userId: number, token: string, platform: string) {
        const existing = await this.deviceTokens.findOne({ where: { token } });
        if (existing) {
            existing.userId = userId;
            existing.platform = platform;
            await this.deviceTokens.save(existing);
        } else {
            await this.deviceTokens.save(
                this.deviceTokens.create({ userId, token, platform }),
            );
        }
    }

    /** Normal push — shows a system tray banner. */
    async pushToUser(
        userId: number,
        payload: { title: string; body: string; data?: Record<string, string> },
    ) {
        const tokens = await this.deviceTokens.find({ where: { userId } });
        if (tokens.length === 0) return;

        const { invalidTokens } = await this.firebase.sendToTokens(
            tokens.map((t) => t.token),
            payload,
        );
        if (invalidTokens.length > 0) {
            await this.deviceTokens.delete({ token: In(invalidTokens) });
        }
    }

    /** Data-only push — used for incoming calls (see CallsService). */
    async pushDataOnly(userId: number, data: Record<string, string>) {
        const tokens = await this.deviceTokens.find({ where: { userId } });
        if (tokens.length === 0) return;

        const { invalidTokens } = await this.firebase.sendDataOnly(
            tokens.map((t) => t.token),
            data,
        );
        if (invalidTokens.length > 0) {
            await this.deviceTokens.delete({ token: In(invalidTokens) });
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