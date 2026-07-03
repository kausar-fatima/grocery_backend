import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Product } from './products.entity';
import { Store } from '../stores/stores.entity';
import { Category } from '../categories/categories.entity';

import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,

        @InjectRepository(Store)
        private storeRepository: Repository<Store>,

        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) { }

    async create(dto: CreateProductDto) {
        const store =
            await this.storeRepository.findOne({
                where: {
                    id: dto.storeId,
                },
            });

        const category =
            await this.categoryRepository.findOne({
                where: {
                    id: dto.categoryId,
                },
            });

        if (!store) {
            throw new NotFoundException(
                'Store not found',
            );
        }

        if (!category) {
            throw new NotFoundException(
                'Category not found',
            );
        }

        const product =
            this.productRepository.create({
                name: dto.name,
                description: dto.description,
                price: dto.price,
                stock: dto.stock,
                store,
                category,
            });

        return await this.productRepository.save(
            product,
        );
    }

    async findAll() {
        return await this.productRepository.find({
            relations: [
                'store',
                'category',
            ],
        });
    }

    async findOne(id: number) {
        const product =
            await this.productRepository.findOne({
                where: { id },
                relations: [
                    'store',
                    'category',
                ],
            });

        if (!product) {
            throw new NotFoundException(
                'Product not found',
            );
        }

        return product;
    }

    async update(
        id: number,
        body: Partial<Product>,
    ) {
        const product =
            await this.findOne(id);

        Object.assign(product, body);

        return await this.productRepository.save(
            product,
        );
    }

    async remove(id: number) {
        const product =
            await this.findOne(id);

        await this.productRepository.remove(
            product,
        );

        return {
            message:
                'Product deleted successfully',
        };
    }
}