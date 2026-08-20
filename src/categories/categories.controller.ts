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

import { CategoriesService } from './categories.service';

import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user_role.enum';

@Controller('categories')
export class CategoriesController {
    constructor(
        private categoriesService: CategoriesService,
    ) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.STORE_OWNER, UserRole.ADMIN)
    @Post()
    create(@Body() dto: CreateCategoryDto) {
        return this.categoriesService.create(dto);
    }

    @Get()
    findAll() {
        return this.categoriesService.findAll();
    }

    @Get('store/:storeId')
    byStore(@Param('storeId') storeId: string) {
        return this.categoriesService.findByStore(+storeId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.categoriesService.findOne(+id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.STORE_OWNER, UserRole.ADMIN)
    @Patch(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.categoriesService.update(+id, body);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.STORE_OWNER, UserRole.ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.categoriesService.remove(+id);
    }
}
