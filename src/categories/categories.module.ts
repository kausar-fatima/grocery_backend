import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

import { Category } from './categories.entity';
import { Store } from 'src/stores/stores.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      Store,
    ]),
  ],

  controllers: [
    CategoriesController,
  ],

  providers: [
    CategoriesService,
  ],

  exports: [
    CategoriesService,
  ],
})
export class CategoriesModule { }