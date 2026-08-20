import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create_order.dto';
import { OrderStatus } from 'src/common/enums/order_status.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserRole } from 'src/common/enums/user_role.enum';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    create(@Body() dto: CreateOrderDto) {
        return this.ordersService.create(dto);
    }

    // --- Specific routes must precede the ':id' param route ---

    @UseGuards(JwtAuthGuard)
    @Get('mine')
    myOrders(@CurrentUser('sub') userId: number) {
        return this.ordersService.findForUser(userId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.RIDER)
    @Get('available')
    availableForRider(
        @Query('lat') lat?: string,
        @Query('lng') lng?: string,
        @Query('radius') radius?: string,
    ) {
        return this.ordersService.availableForRider(
            lat != null ? parseFloat(lat) : undefined,
            lng != null ? parseFloat(lng) : undefined,
            radius != null ? parseFloat(radius) : 15,
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.RIDER)
    @Get('rider/mine')
    riderOrders(@CurrentUser('sub') riderId: number) {
        return this.ordersService.findForRider(riderId);
    }

    @Get()
    findAll() {
        return this.ordersService.findAll();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.RIDER)
    @Patch(':id/assign')
    assign(
        @Param('id') id: string,
        @CurrentUser('sub') riderId: number,
    ) {
        return this.ordersService.assignRider(+id, riderId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.RIDER)
    @Patch(':id/location')
    updateLocation(
        @Param('id') id: string,
        @Body() body: { lat: number; lng: number },
    ) {
        return this.ordersService.updateLocation(+id, body.lat, body.lng);
    }

    // The road route (store → destination) the rider follows, for the map.
    @Get(':id/route')
    route(@Param('id') id: string) {
        return this.ordersService.getRoute(+id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(+id);
    }

    @Patch(':id/:status')
    update(
        @Param('id') id: string,
        @Param('status') status: OrderStatus,
    ) {
        return this.ordersService.updateStatus(+id, status);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.ordersService.delete(+id);
    }
}
