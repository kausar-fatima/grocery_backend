import {
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly service: NotificationsService) {}

    @Get()
    forUser(@CurrentUser('sub') userId: number) {
        return this.service.forUser(userId);
    }

    @Get('unread')
    unread(@CurrentUser('sub') userId: number) {
        return this.service.unread(userId);
    }

    @Patch('read-all')
    markAllRead(@CurrentUser('sub') userId: number) {
        return this.service.markAllRead(userId);
    }

    @Patch(':id/read')
    markRead(@Param('id') id: string) {
        return this.service.markRead(+id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(+id);
    }
}
