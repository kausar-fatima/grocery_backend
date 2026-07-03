import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';

import { User } from 'src/users/users.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from 'src/common/enums/user_role.enum';
import { randomUUID } from 'crypto';
import { MailerService } from '@nestjs-modules/mailer';
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private jwtService: JwtService,
        private mailService: MailerService,
    ) {}

    async register(registerDto: RegisterDto){
        const existingUser =
            await this.usersRepository.findOne({
                where: {
                    email: registerDto.email,
                },
            });

        if (existingUser) {
            throw new BadRequestException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const user = this.usersRepository.create({
            ...registerDto,
            password: hashedPassword,
        });

        if (
            registerDto.role ===
            UserRole.CUSTOMER
        ) {
            user.verificationToken =
                randomUUID();

            await this.usersRepository.save(user);
            const link = `http://localhost:3000/auth/verify/${user.verificationToken}`;
            await this.mailService.sendMail({
                to: user.email,
                subject: 'Verify your email',
                html: `
                      <p>Please verify your email by clicking the link below:</p>
                      <a href="${link}">Verify Email</a>
                    `,
            });
            return {
                message:
                    'Please verify your email.',
            };
        }
        await this.usersRepository.save(user);
        return {
            message:
                'Registration submitted for approval.',
        };
    }

    async verifyEmail(token: string) {
        const user = await this.usersRepository.findOne({
            where: {
                verificationToken: token,
            },
        });

        if (!user) {
            throw new BadRequestException(
                'Invalid token',
            );
        }

        user.isApproved = true;

        user.verificationToken = '';

        await this.usersRepository.save(user);

        return {
            message:
                'Email verified successfully.',
        };
    }

    async approveStoreOwner(userId: number) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException();
        }

        user.isApproved = !user.isApproved;

        await this.usersRepository.save(user);

        return {
            message:
                'Store owner approved or declined.',
        };
    }

    async login({ email, password }: LoginDto) {
        const user = await this.usersRepository.findOne({
            where: { email },
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.role === UserRole.CUSTOMER && !user.isApproved) {
            throw new UnauthorizedException('Please verify your email.');
        }

        if (user.role === UserRole.STORE_OWNER && !user.isApproved) {
            throw new UnauthorizedException('Waiting for admin approval.');
        }

        const access_token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            access_token,
            user,
        };
    }
}
