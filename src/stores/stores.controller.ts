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

import { StoresService } from './stores.service';

import { CreateStoreDto } from './dto/create-store.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserRole } from 'src/common/enums/user_role.enum';

@Controller('stores')
export class StoresController {
    constructor(
        private storesService: StoresService,
    ) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.STORE_OWNER, UserRole.ADMIN)
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

    @UseGuards(JwtAuthGuard)
    @Get('owner/mine')
    myStores(@CurrentUser('sub') ownerId: number) {
        return this.storesService.findByOwner(ownerId);
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