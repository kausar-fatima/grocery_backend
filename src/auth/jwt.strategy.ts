import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';

import {
    ExtractJwt,
    Strategy,
} from 'passport-jwt';

import { ConfigService } from '@nestjs/config';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/users/users.entity';
import { UserRole } from 'src/common/enums/user_role.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        configService: ConfigService,

        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {
        super({
            jwtFromRequest:
                ExtractJwt.fromAuthHeaderAsBearerToken(),

            ignoreExpiration: false,

            secretOrKey:
                configService.get<string>('JWT_SECRET'),
        });
    }

    async validate(payload: any) {
        const user = await this.usersRepository.findOne({
            where: {
                id: payload.sub,
            },
        });

        // User was permanently removed.
        if (!user) {
            throw new UnauthorizedException(
                'User account no longer exists.',
            );
        }

        // User was soft deleted.
        if (user.isSoftDeleted) {
            throw new UnauthorizedException(
                'This account is no longer active.',
            );
        }

        // Store owner or rider was revoked.
        if (
            (user.role === UserRole.STORE_OWNER ||
                user.role === UserRole.RIDER) &&
            !user.isApproved
        ) {
            throw new UnauthorizedException(
                'Your account has been revoked.',
            );
        }

        return {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
    }
}