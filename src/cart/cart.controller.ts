import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';

@Controller('cart')
export class CartController {
    constructor(
        private readonly cartService: CartService,
    ) { }

    @Post()
    create(@Body() dto: CreateCartDto) {
        return this.cartService.create(dto);
    }

    @Get()
    findAll() {
        return this.cartService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.cartService.findOne(+id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.cartService.delete(+id);
    }
}