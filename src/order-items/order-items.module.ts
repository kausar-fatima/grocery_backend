import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderItem } from './order-item.entity';
import { Order } from 'src/orders/orders.entity';
import { Product } from 'src/products/products.entity';

import { OrderItemsController } from './order-items.controller';
import { OrderItemsService } from './order-items.service';

@Module({

  imports: [
    TypeOrmModule.forFeature([
      OrderItem,
      Order,
      Product,
    ]),
  ],

  controllers: [
    OrderItemsController,
  ],

  providers: [
    OrderItemsService,
  ],
})
export class OrderItemsModule { }