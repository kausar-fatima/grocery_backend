import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Delete,
} from '@nestjs/common';

import { CartItemsService } from './cart-items.service';

import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart-items')
export class CartItemsController {

    constructor(
        private service: CartItemsService,
    ) { }

    @Post()
    create(
        @Body() dto: CreateCartItemDto,
    ) {
        return this.service.create(dto);
    }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(
        @Param('id') id: number,
    ) {
        return this.service.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: number,
        @Body() dto: UpdateCartItemDto,
    ) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    delete(
        @Param('id') id: number,
    ) {
        return this.service.delete(id);
    }
}