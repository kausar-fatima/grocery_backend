import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Order } from 'src/orders/orders.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
    imports: [TypeOrmModule.forFeature([Message, Order]), NotificationsModule],
    controllers: [MessagesController],
    providers: [MessagesService],
})
export class MessagesModule {}
