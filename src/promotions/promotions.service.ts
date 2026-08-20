import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './promotion.entity';
import { Order } from '../orders/orders.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionsService {
    constructor(
        @InjectRepository(Promotion)
        private repo: Repository<Promotion>,
        @InjectRepository(Order)
        private orders: Repository<Order>,
    ) {}

    /** All promotions (admin view), newest first. */
    findAll() {
        return this.repo.find({ order: { createdAt: 'DESC' } });
    }

    findOne(id: number) {
        return this.repo.findOne({ where: { id } });
    }

    /** The newest active promotion, regardless of user eligibility. */
    findActive() {
        return this.repo.findOne({
            where: { active: true },
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * The active promotion that applies to [userId] right now — respects
     * `firstOrderOnly` by checking the user's existing order count. Returns
     * null when nothing applies (drives both the banner and checkout).
     */
    async activeForUser(userId: number): Promise<Promotion | null> {
        const promo = await this.findActive();
        if (!promo) return null;
        if (promo.firstOrderOnly) {
            const count = await this.orders.count({
                where: { user: { id: userId } },
            });
            if (count > 0) return null;
        }
        return promo;
    }

    /** Discount amount (2dp) a promotion yields on the given subtotal. */
    computeDiscount(subtotal: number, promo?: Promotion | null): number {
        if (!promo || !promo.active || promo.discountPercent <= 0) return 0;
        if (subtotal < Number(promo.minSubtotal ?? 0)) return 0;
        const raw = (subtotal * promo.discountPercent) / 100;
        return Math.round(raw * 100) / 100;
    }

    create(dto: CreatePromotionDto) {
        const promo = this.repo.create({
            title: dto.title,
            description: dto.description ?? '',
            discountPercent: dto.discountPercent,
            active: dto.active ?? true,
            firstOrderOnly: dto.firstOrderOnly ?? false,
            minSubtotal: dto.minSubtotal ?? 0,
        });
        return this.repo.save(promo);
    }

    async update(id: number, dto: UpdatePromotionDto) {
        const promo = await this.repo.findOne({ where: { id } });
        if (!promo) throw new NotFoundException('Promotion not found');
        Object.assign(promo, {
            title: dto.title ?? promo.title,
            description: dto.description ?? promo.description,
            discountPercent: dto.discountPercent ?? promo.discountPercent,
            active: dto.active ?? promo.active,
            firstOrderOnly: dto.firstOrderOnly ?? promo.firstOrderOnly,
            minSubtotal: dto.minSubtotal ?? promo.minSubtotal,
        });
        return this.repo.save(promo);
    }

    async remove(id: number) {
        const promo = await this.repo.findOne({ where: { id } });
        if (!promo) throw new NotFoundException('Promotion not found');
        await this.repo.delete(id);
        return { message: 'Promotion deleted' };
    }
}
