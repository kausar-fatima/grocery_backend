import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CartItem } from './cart-item.entity';
import { Cart } from 'src/cart/cart.entity';
import { Product } from 'src/products/products.entity';

import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartItemsService {

    constructor(

        @InjectRepository(CartItem)
        private cartItemRepository: Repository<CartItem>,

        @InjectRepository(Cart)
        private cartRepository: Repository<Cart>,

        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    async create(dto: CreateCartItemDto) {

        const cart = await this.cartRepository.findOne({
            where: { id: dto.cartId },
        });

        if (!cart)
            throw new NotFoundException('Cart not found');

        const product = await this.productRepository.findOne({
            where: { id: dto.productId },
        });

        if (!product)
            throw new NotFoundException('Product not found');

        const item = this.cartItemRepository.create({
            cart,
            product,
            quantity: dto.quantity,
        });

        return this.cartItemRepository.save(item);
    }

    async findAll() {

        return this.cartItemRepository.find({
            relations: ['cart', 'product'],
        });
    }

    async findOne(id: number) {

        return this.cartItemRepository.findOne({
            where: { id },
            relations: ['cart', 'product'],
        });
    }

    async update(
        id: number,
        dto: UpdateCartItemDto,
    ) {

        const item = await this.findOne(id);

        if (!item)
            throw new NotFoundException();

        item.quantity = dto.quantity;

        return this.cartItemRepository.save(item);
    }

    async delete(id: number) {

        await this.cartItemRepository.delete(id);

        return {
            message: 'Deleted successfully',
        };
    }
}