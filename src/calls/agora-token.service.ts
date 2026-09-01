import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RtcTokenBuilder, RtcRole } from 'agora-token';

@Injectable()
export class AgoraTokenService {
    constructor(private readonly config: ConfigService) { }

    /**
     * Generates a short-lived Agora RTC token for a specific user joining a
     * specific channel. Agora requires a numeric uid per participant — we
     * use the user's own database id, which is already a stable number.
     */
    generateRtcToken(channelName: string, uid: number): string {
        const appId = this.config.getOrThrow<string>('AGORA_APP_ID');
        const appCertificate = this.config.getOrThrow<string>(
            'AGORA_APP_CERTIFICATE',
        );
        const expireSeconds = 3600;

        return RtcTokenBuilder.buildTokenWithUid(
            appId,
            appCertificate,
            channelName,
            uid,
            RtcRole.PUBLISHER,
            expireSeconds,
            expireSeconds,
        );
    }
}