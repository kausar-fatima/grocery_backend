import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create_order.dto';
import { OrderStatus } from 'src/common/enums/order_status.enum';

@Controller('orders')
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
    ) { }

    @Post()
    create(
        @Body()
        dto: CreateOrderDto,
    ) {
        return this.ordersService.create(dto);
    }

    @Get()
    findAll() {
        return this.ordersService.findAll();
    }

    @Get(':id')
    findOne(
        @Param('id')
        id: string,
    ) {
        return this.ordersService.findOne(+id);
    }

    @Patch(':id/:status')
    update(
        @Param('id')
        id: string,
        @Param('status')
        status: OrderStatus,
    ) {
        return this.ordersService.updateStatus(
            +id,
            status,
        );
    }

    @Delete(':id')
    delete(
        @Param('id') id: string,
    ) {
        return this.ordersService.delete(+id);
    }
}
