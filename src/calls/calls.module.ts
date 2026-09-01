import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Call } from './call.entity';
import { CallsService } from './calls.service';
import { CallsController } from './calls.controller';
import { AgoraTokenService } from './agora-token.service';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
    imports: [TypeOrmModule.forFeature([Call]), NotificationsModule],
    controllers: [CallsController],
    providers: [CallsService, AgoraTokenService],
})
export class CallsModule { }