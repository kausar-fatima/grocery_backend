import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Cart } from './cart.entity';
import { CartItem } from '../cart-items/cart-item.entity';
import { User } from '../users/users.entity';
import { Product } from '../products/products.entity';

import { CreateCartDto } from './dto/create-cart.dto';

@Injectable()
export class CartService {

    constructor(

        @InjectRepository(Cart)
        private cartRepository: Repository<Cart>,

        @InjectRepository(CartItem)
        private cartItemRepository: Repository<CartItem>,

        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(Product)
        private productRepository: Repository<Product>,

    ){}

    async create(dto:CreateCartDto){

        const user=await this.userRepository.findOne({
            where:{id:dto.userId},
        });

        if(!user)
            throw new NotFoundException('User not found');

        let cart=await this.cartRepository.findOne({

            where:{
                user:{
                    id:user.id,
                },
            },

            relations:['items'],

        });

        if(!cart){

            cart=this.cartRepository.create({
                user,
            });

            cart=await this.cartRepository.save(cart);

        }

        for(const item of dto.items){

            const product=await this.productRepository.findOne({
                where:{id:item.productId},
            });

            if(!product)
                throw new NotFoundException(`Product ${item.productId} not found`);

            const cartItem=this.cartItemRepository.create({

                cart,

                product,

                quantity:item.quantity,

            });

            await this.cartItemRepository.save(cartItem);

        }

        return await this.cartRepository.findOne({

            where:{id:cart.id},
            relations:[
                'user',
                'items',
                'items.product',
            ],
        });
    }

    async findAll(){

        return this.cartRepository.find({
            relations:[
                'user',
                'items',
                'items.product',
            ],
        });
    }

    async findOne(id:number){

        return this.cartRepository.findOne({
            where:{id},
            relations:[
                'user',
                'items',
                'items.product',
            ],
        });
    }

    async delete(id: number) {
        await this.cartRepository.delete(id);

        return {
            message: 'Cart deleted',
        };
    }

}