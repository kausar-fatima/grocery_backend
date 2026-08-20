import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Call } from './call.entity';
import { CallsService } from './calls.service';
import { CallsController } from './calls.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Call])],
    controllers: [CallsController],
    providers: [CallsService],
})
export class CallsModule {}
