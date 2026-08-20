import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private reviewRepository: Repository<Review>,
    ) {}

    async create(userId: number, dto: CreateReviewDto) {
        const review = this.reviewRepository.create({
            userId,
            productId: dto.productId ?? null,
            orderId: dto.orderId ?? null,
            rating: dto.rating,
            comment: dto.comment ?? '',
        });
        return this.reviewRepository.save(review);
    }

    findAll() {
        return this.reviewRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    findByProduct(productId: number) {
        return this.reviewRepository.find({
            where: { productId },
            order: { createdAt: 'DESC' },
        });
    }

    async summaryForProduct(productId: number) {
        const reviews = await this.findByProduct(productId);
        const count = reviews.length;
        const average =
            count === 0
                ? 0
                : reviews.reduce((sum, r) => sum + r.rating, 0) / count;
        return {
            productId,
            count,
            average: Number(average.toFixed(2)),
            reviews,
        };
    }

    async remove(id: number) {
        await this.reviewRepository.delete(id);
        return { message: 'Review deleted' };
    }
}
