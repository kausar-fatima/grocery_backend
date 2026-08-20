import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Address } from './address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
    constructor(
        @InjectRepository(Address)
        private repo: Repository<Address>,
    ) {}

    forUser(userId: number) {
        return this.repo.find({
            where: { userId },
            order: { isDefault: 'DESC', createdAt: 'DESC' },
        });
    }

    async create(userId: number, dto: CreateAddressDto) {
        // The very first address (or one explicitly flagged) becomes default.
        const count = await this.repo.count({ where: { userId } });
        const makeDefault = dto.isDefault === true || count === 0;
        if (makeDefault) {
            await this.repo.update({ userId }, { isDefault: false });
        }
        const address = this.repo.create({
            userId,
            label: dto.label,
            street: dto.street,
            city: dto.city ?? '',
            state: dto.state ?? '',
            zip: dto.zip ?? '',
            phone: dto.phone ?? '',
            latitude: dto.latitude ?? null,
            longitude: dto.longitude ?? null,
            isDefault: makeDefault,
        });
        return this.repo.save(address);
    }

    async update(userId: number, id: number, dto: UpdateAddressDto) {
        const address = await this.repo.findOne({ where: { id } });
        if (!address) throw new NotFoundException('Address not found');
        if (address.userId !== userId) throw new ForbiddenException();

        if (dto.isDefault === true) {
            await this.repo.update(
                { userId, id: Not(id) },
                { isDefault: false },
            );
        }
        Object.assign(address, {
            label: dto.label ?? address.label,
            street: dto.street ?? address.street,
            city: dto.city ?? address.city,
            state: dto.state ?? address.state,
            zip: dto.zip ?? address.zip,
            phone: dto.phone ?? address.phone,
            latitude: dto.latitude ?? address.latitude,
            longitude: dto.longitude ?? address.longitude,
            isDefault: dto.isDefault ?? address.isDefault,
        });
        return this.repo.save(address);
    }

    async remove(userId: number, id: number) {
        const address = await this.repo.findOne({ where: { id } });
        if (!address) throw new NotFoundException('Address not found');
        if (address.userId !== userId) throw new ForbiddenException();
        const wasDefault = address.isDefault;
        await this.repo.delete(id);

        // If we removed the default, promote the newest remaining address.
        if (wasDefault) {
            const next = await this.repo.findOne({
                where: { userId },
                order: { createdAt: 'DESC' },
            });
            if (next) {
                next.isDefault = true;
                await this.repo.save(next);
            }
        }
        return { message: 'Address deleted' };
    }
}
