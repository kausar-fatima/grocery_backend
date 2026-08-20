import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Store } from './stores.entity';
import { User } from 'src/users/users.entity';

import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoresService {
    constructor(
        @InjectRepository(Store)
        private storeRepository: Repository<Store>,

        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async create(dto: CreateStoreDto) {
        const owner =
            await this.userRepository.findOne({
                where: {
                    id: dto.ownerId,
                },
            });

        if (!owner) {
            throw new NotFoundException(
                'Owner not found',
            );
        }

        const store =
            this.storeRepository.create({
                name: dto.name,
                address: dto.address,
                phone: dto.phone,
                latitude: dto.latitude ?? null,
                longitude: dto.longitude ?? null,
                opensAt: dto.opensAt ?? null,
                closesAt: dto.closesAt ?? null,
                owner,
            });

        return await this.storeRepository.save(
            store,
        );
    }

    async findAll() {
        return await this.storeRepository.find({
            relations: [
                'owner',
                'categories',
                'products',
            ],
        });
    }

    async findByOwner(ownerId: number) {
        return await this.storeRepository.find({
            where: { owner: { id: ownerId } },
            relations: ['categories', 'products'],
        });
    }

    async findOne(id: number) {
        const store =
            await this.storeRepository.findOne({
                where: { id },
                relations: [
                    'owner',
                    'categories',
                    'products',
                ],
            });

        if (!store) {
            throw new NotFoundException(
                'Store not found',
            );
        }

        return store;
    }

    async update(
        id: number,
        body: Partial<Store>,
    ) {
        const store =
            await this.findOne(id);

        Object.assign(store, body);

        return await this.storeRepository.save(
            store,
        );
    }

    async remove(id: number) {
        const store =
            await this.findOne(id);

        await this.storeRepository.remove(
            store,
        );

        return {
            message:
                'Store deleted successfully',
        };
    }
}