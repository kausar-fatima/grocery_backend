import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { DeviceToken } from './device-token.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification, DeviceToken]),
        FirebaseModule,
    ],
    controllers: [NotificationsController],
    providers: [NotificationsService],
    exports: [NotificationsService],
})
export class NotificationsModule { }