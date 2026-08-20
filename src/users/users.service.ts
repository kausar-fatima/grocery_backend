import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from './users.entity';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

    async findAll() {
        return await this.usersRepository.find();
    }

    async findOne(id: number) {
        const user = await this.usersRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException(
                'User not found',
            );
        }
        return user;
    }

    async update(
        id: number,
        updateData: Partial<User>,
    ) {
        const user = await this.findOne(id);

        Object.assign(user, updateData);

        return await this.usersRepository.save(
            user,
        );
    }

    async remove(id: number) {
        const user = await this.findOne(id);

        user.isSoftDeleted = true;
        await this.usersRepository.save(user);

        return {
            message: 'User deleted successfully',
        };
    }
}
