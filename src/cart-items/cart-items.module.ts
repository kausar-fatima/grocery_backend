import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { CartItem } from './cart-item.entity';
import { Cart } from 'src/cart/cart.entity';
import { Product } from 'src/products/products.entity';

import { CartItemsController } from './cart-items.controller';
import { CartItemsService } from './cart-items.service';

@Module({

  imports: [
    TypeOrmModule.forFeature([
      CartItem,
      Cart,
      Product,
    ]),
  ],

  controllers: [
    CartItemsController,
  ],

  providers: [
    CartItemsService,
  ],
})
export class CartItemsModule { }