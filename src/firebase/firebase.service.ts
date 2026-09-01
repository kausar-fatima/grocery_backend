import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import {
    initializeApp,
    cert,
    getApps,
    getApp,
    App,
    ServiceAccount,
} from 'firebase-admin/app';
import {
    getMessaging,
    MulticastMessage,
    BatchResponse,
} from 'firebase-admin/messaging';

@Injectable()
export class FirebaseService implements OnModuleInit {
    private readonly logger = new Logger(FirebaseService.name);
    private app!: App;

    constructor(private readonly config: ConfigService) { }

    onModuleInit() {
        if (getApps().length) {
            this.app = getApp();
            return;
        }
        const path = this.config.getOrThrow<string>(
            'FIREBASE_SERVICE_ACCOUNT_PATH',
        );
        const credential = JSON.parse(
            fs.readFileSync(path, 'utf8'),
        ) as ServiceAccount;
        this.app = initializeApp({
            credential: cert(credential),
        });
        this.logger.log('Firebase Admin SDK initialized');
    }

    /** Normal push: shows a system tray banner automatically. */
    async sendToTokens(
        tokens: string[],
        payload: { title: string; body: string; data?: Record<string, string> },
    ): Promise<{ successCount: number; invalidTokens: string[] }> {
        if (tokens.length === 0) return { successCount: 0, invalidTokens: [] };

        const message: MulticastMessage = {
            tokens,
            notification: { title: payload.title, body: payload.body },
            data: payload.data ?? {},
            android: {
                priority: 'high',
                notification: { channelId: 'default_channel' },
            },
            apns: { payload: { aps: { sound: 'default' } } },
        };

        const response = await getMessaging(this.app).sendEachForMulticast(message);
        return this.collectInvalidTokens(response, tokens);
    }

    /**
     * Data-only push: no `notification` block, so the OS does NOT auto-show
     * a banner. Used for things the app must handle itself — specifically,
     * incoming calls, which trigger flutter_callkit_incoming instead of a
     * plain notification.
     */
    async sendDataOnly(
        tokens: string[],
        data: Record<string, string>,
    ): Promise<{ successCount: number; invalidTokens: string[] }> {
        if (tokens.length === 0) return { successCount: 0, invalidTokens: [] };

        const message: MulticastMessage = {
            tokens,
            data,
            android: { priority: 'high' },
            apns: {
                headers: {
                    'apns-priority': '10',
                    'apns-push-type': 'background',
                },
                payload: { aps: { 'content-available': 1 } },
            },
        };

        const response = await getMessaging(this.app).sendEachForMulticast(message);
        return this.collectInvalidTokens(response, tokens);
    }

    private collectInvalidTokens(response: BatchResponse, tokens: string[]) {
        const invalidTokens: string[] = [];
        response.responses.forEach((res, i) => {
            if (!res.success) {
                const code = res.error?.code;
                this.logger.warn(`Push failed for token ${tokens[i]}: ${code}`);
                if (
                    code === 'messaging/invalid-registration-token' ||
                    code === 'messaging/registration-token-not-registered'
                ) {
                    invalidTokens.push(tokens[i]);
                }
            }
        });
        return { successCount: response.successCount, invalidTokens };
    }
}