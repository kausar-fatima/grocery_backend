import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
    constructor(private readonly service: AddressesService) {}

    @Get()
    forUser(@CurrentUser('sub') userId: number) {
        return this.service.forUser(userId);
    }

    @Post()
    create(
        @CurrentUser('sub') userId: number,
        @Body() dto: CreateAddressDto,
    ) {
        return this.service.create(userId, dto);
    }

    @Patch(':id')
    update(
        @CurrentUser('sub') userId: number,
        @Param('id') id: string,
        @Body() dto: UpdateAddressDto,
    ) {
        return this.service.update(userId, +id, dto);
    }

    @Delete(':id')
    remove(
        @CurrentUser('sub') userId: number,
        @Param('id') id: string,
    ) {
        return this.service.remove(userId, +id);
    }
}
