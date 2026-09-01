import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StoresModule } from './stores/stores.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { CartItemsModule } from './cart-items/cart-items.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { ReviewsModule } from './reviews/reviews.module';
import { MessagesModule } from './messages/messages.module';
import { CallsModule } from './calls/calls.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AddressesModule } from './addresses/addresses.module';
import { PromotionsModule } from './promotions/promotions.module';
import { FirebaseController } from './firebase/firebase.controller';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule, AuthModule, StoresModule, CategoriesModule, ProductsModule, CartModule, OrdersModule, PaymentsModule, CartItemsModule, OrderItemsModule, ReviewsModule, MessagesModule, CallsModule, AdminModule, NotificationsModule, AddressesModule, PromotionsModule, FirebaseModule],
  controllers: [AppController, FirebaseController],
  providers: [AppService],
})
export class AppModule {}
