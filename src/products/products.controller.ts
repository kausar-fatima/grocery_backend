import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
} from '@nestjs/common';

import { ProductsService } from './products.service';

import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user_role.enum';

@Controller('products')
export class ProductsController {
    constructor(
        private productsService: ProductsService,
    ) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.STORE_OWNER, UserRole.ADMIN)
    @Post()
    create(@Body() dto: CreateProductDto) {
        return this.productsService.create(dto);
    }

    @Get()
    findAll() {
        return this.productsService.findAll();
    }

    @Get('store/:storeId')
    byStore(@Param('storeId') storeId: string) {
        return this.productsService.findByStore(+storeId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(+id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.STORE_OWNER, UserRole.ADMIN)
    @Patch(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.productsService.update(+id, body);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.STORE_OWNER, UserRole.ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.productsService.remove(+id);
    }
}
