import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { CallsService } from './calls.service';
import { CreateCallDto } from './dto/create-call.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('calls')
export class CallsController {
    constructor(private readonly callsService: CallsService) {}

    @Post()
    initiate(
        @CurrentUser('sub') callerId: number,
        @Body() dto: CreateCallDto,
    ) {
        return this.callsService.initiate(callerId, dto);
    }

    @Get('incoming')
    incoming(@CurrentUser('sub') userId: number) {
        return this.callsService.incoming(userId);
    }

    @Get('history')
    history(@CurrentUser('sub') userId: number) {
        return this.callsService.history(userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.callsService.findOne(+id);
    }

    @Patch(':id/answer')
    answer(@Param('id') id: string) {
        return this.callsService.answer(+id);
    }

    @Patch(':id/decline')
    decline(@Param('id') id: string) {
        return this.callsService.decline(+id);
    }

    @Patch(':id/end')
    end(@Param('id') id: string) {
        return this.callsService.end(+id);
    }
}
