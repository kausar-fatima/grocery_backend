import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './orders.entity';
import { Product } from 'src/products/products.entity';
import { User } from 'src/users/users.entity';
import { OrderItem } from 'src/order-items/order-item.entity';
import { Cart } from 'src/cart/cart.entity';
import { CartItem } from 'src/cart-items/cart-item.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { PromotionsModule } from 'src/promotions/promotions.module';
import { DeliverySimulationService } from './delivery-simulation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Cart,
      CartItem,
      Product,
      User,
    ]),
    NotificationsModule,
    PromotionsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, DeliverySimulationService],
})
export class OrdersModule { }
