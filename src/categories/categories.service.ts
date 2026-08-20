import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Category } from './categories.entity';
import { Store } from 'src/stores/stores.entity';

import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,

        @InjectRepository(Store)
        private storeRepository: Repository<Store>,
    ) { }

    async create(
        dto: CreateCategoryDto,
    ) {
        const store =
            await this.storeRepository.findOne({
                where: {
                    id: dto.storeId,
                },
            });

        if (!store) {
            throw new NotFoundException(
                'Store not found',
            );
        }

        const category =
            this.categoryRepository.create({
                name: dto.name,
                store,
            });

        return await this.categoryRepository.save(
            category,
        );
    }

    async findAll() {
        return await this.categoryRepository.find({
            relations: [
                'store',
                'products',
            ],
        });
    }

    async findByStore(storeId: number) {
        return await this.categoryRepository.find({
            where: { store: { id: storeId } },
            relations: ['products'],
        });
    }

    async findOne(id: number) {
        const category =
            await this.categoryRepository.findOne({
                where: { id },
                relations: [
                    'store',
                    'products',
                ],
            });

        if (!category) {
            throw new NotFoundException(
                'Category not found',
            );
        }

        return category;
    }

    async update(
        id: number,
        body: Partial<Category>,
    ) {
        const category =
            await this.findOne(id);

        Object.assign(
            category,
            body,
        );

        return await this.categoryRepository.save(
            category,
        );
    }

    async remove(id: number) {
        const category =
            await this.findOne(id);

        await this.categoryRepository.remove(
            category,
        );

        return {
            message:
                'Category deleted successfully',
        };
    }
}