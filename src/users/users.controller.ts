import {
    Controller,
    Get,
    Param,
    Patch,
    Delete,
    Body,
} from '@nestjs/common';

import { UsersService } from './users.service';

import { User } from './users.entity';

@Controller('users')
export class UsersController {
    constructor(
        private usersService: UsersService,
    ) { }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() body: Partial<User>,
    ) {
        return this.usersService.update(
            +id,
            body,
        );
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }
}