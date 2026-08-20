import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/users.entity';
import { Order } from '../orders/orders.entity';
import { Product } from '../products/products.entity';
import { Store } from '../stores/stores.entity';
import { Review } from '../reviews/review.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Order, Product, Store, Review]),
        NotificationsModule,
    ],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule {}
