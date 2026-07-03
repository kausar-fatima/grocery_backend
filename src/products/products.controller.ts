import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body,
} from '@nestjs/common';

import { ProductsService } from './products.service';

import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
    constructor(
        private productsService: ProductsService,
    ) { }

    @Post()
    create(
        @Body()
        dto: CreateProductDto,
    ) {
        return this.productsService.create(
            dto,
        );
    }

    @Get()
    findAll() {
        return this.productsService.findAll();
    }

    @Get(':id')
    findOne(
        @Param('id')
        id: string,
    ) {
        return this.productsService.findOne(
            +id,
        );
    }

    @Patch(':id')
    update(
        @Param('id')
        id: string,
        @Body()
        body: any,
    ) {
        return this.productsService.update(
            +id,
            body,
        );
    }

    @Delete(':id')
    remove(
        @Param('id')
        id: string,
    ) {
        return this.productsService.remove(
            +id,
        );
    }
}