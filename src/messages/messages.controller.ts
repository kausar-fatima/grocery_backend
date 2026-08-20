import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}

    @Post()
    send(
        @CurrentUser('sub') senderId: number,
        @Body() dto: CreateMessageDto,
    ) {
        return this.messagesService.send(senderId, dto);
    }

    @Get('order/:orderId')
    forOrder(@Param('orderId') orderId: string) {
        return this.messagesService.findForOrder(+orderId);
    }

    @Patch('order/:orderId/read')
    markRead(
        @Param('orderId') orderId: string,
        @CurrentUser('sub') userId: number,
    ) {
        return this.messagesService.markRead(+orderId, userId);
    }

    @Get('unread')
    unread(@CurrentUser('sub') userId: number) {
        return this.messagesService.unreadCount(userId);
    }
}
