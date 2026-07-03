import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Delete,
} from '@nestjs/common';

import { OrderItemsService } from './order-items.service';

import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

@Controller('order-items')
export class OrderItemsController {

    constructor(
        private service: OrderItemsService,
    ) { }

    @Post()
    create(@Body() dto: CreateOrderItemDto) {
        return this.service.create(dto);
    }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.service.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: number,
        @Body() dto: UpdateOrderItemDto,
    ) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: number) {
        return this.service.delete(id);
    }
}