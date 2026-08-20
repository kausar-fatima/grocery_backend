import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserRole } from 'src/common/enums/user_role.enum';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    create(
        @CurrentUser('sub') userId: number,
        @Body() dto: CreateReviewDto,
    ) {
        return this.reviewsService.create(userId, dto);
    }

    @Get()
    findAll() {
        return this.reviewsService.findAll();
    }

    @Get('product/:id')
    byProduct(@Param('id') id: string) {
        return this.reviewsService.summaryForProduct(+id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.reviewsService.remove(+id);
    }
}
