import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Query,
    UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user_role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Get('stats')
    stats() {
        return this.adminService.stats();
    }

    @Get('users')
    users(@Query('role') role?: string) {
        return this.adminService.listUsers(role);
    }

    @Get('riders')
    riders() {
        return this.adminService.listRiders();
    }

    @Patch('users/:id/approve')
    approve(
        @Param('id') id: string,
        @Body() body: { approved?: boolean },
    ) {
        return this.adminService.setApproval(+id, body?.approved ?? true);
    }

    @Patch('users/:id/role')
    role(
        @Param('id') id: string,
        @Body() body: { role: UserRole },
    ) {
        return this.adminService.setRole(+id, body.role);
    }

    @Delete('users/:id')
    removeUser(@Param('id') id: string) {
        return this.adminService.removeUser(+id);
    }

    @Get('orders')
    orders() {
        return this.adminService.allOrders();
    }

    @Get('stores')
    stores() {
        return this.adminService.allStores();
    }
}
