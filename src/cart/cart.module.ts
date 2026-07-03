import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './cart.entity';
import { User } from 'src/users/users.entity';
import { Product } from 'src/products/products.entity';
import { CartItem } from 'src/cart-items/cart-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      User,
      Product,
      CartItem,
    ]),
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule { }