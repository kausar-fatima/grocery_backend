import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';

import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoriesController {
    constructor(
        private categoriesService: CategoriesService,
    ) { }

    @Post()
    create(
        @Body()
        dto: CreateCategoryDto,
    ) {
        return this.categoriesService.create(
            dto,
        );
    }

    @Get()
    findAll() {
        return this.categoriesService.findAll();
    }

    @Get(':id')
    findOne(
        @Param('id')
        id: string,
    ) {
        return this.categoriesService.findOne(
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
        return this.categoriesService.update(
            +id,
            body,
        );
    }

    @Delete(':id')
    remove(
        @Param('id')
        id: string,
    ) {
        return this.categoriesService.remove(
            +id,
        );
    }
}