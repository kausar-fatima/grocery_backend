import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products.entity';
import { Store } from 'src/stores/stores.entity';
import { Category } from 'src/categories/categories.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Store,
      Category,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService]
})
export class ProductsModule {}
