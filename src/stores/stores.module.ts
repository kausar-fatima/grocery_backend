import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';

import { Store } from './stores.entity';
import { User } from 'src/users/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Store,
      User,
    ]),
  ],

  controllers: [
    StoresController,
  ],

  providers: [
    StoresService,
  ],

  exports: [
    StoresService,
  ],
})
export class StoresModule { }