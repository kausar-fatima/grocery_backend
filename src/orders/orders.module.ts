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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Cart,
      CartItem,
      Product,
      User,
    ])
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule { }
