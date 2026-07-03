import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body,
} from '@nestjs/common';

import { StoresService } from './stores.service';

import { CreateStoreDto } from './dto/create-store.dto';

@Controller('stores')
export class StoresController {
    constructor(
        private storesService: StoresService,
    ) { }

    @Post()
    create(
        @Body()
        dto: CreateStoreDto,
    ) {
        return this.storesService.create(
            dto,
        );
    }

    @Get()
    findAll() {
        return this.storesService.findAll();
    }

    @Get(':id')
    findOne(
        @Param('id')
        id: string,
    ) {
        return this.storesService.findOne(
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
        return this.storesService.update(
            +id,
            body,
        );
    }

    @Delete(':id')
    remove(
        @Param('id')
        id: string,
    ) {
        return this.storesService.remove(
            +id,
        );
    }
}