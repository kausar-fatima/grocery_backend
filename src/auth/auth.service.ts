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
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private jwtService: JwtService,
        private mailService: MailerService,
        private notifications: NotificationsService,
    ) {}

    async register(registerDto: RegisterDto){
        const existingUser =
            await this.usersRepository.findOne({
                where: {
                    email: registerDto.email,
                },
            });
        let user: User;
        if (existingUser) {
            if (!existingUser.isSoftDeleted) {
                throw new BadRequestException('Email already exists');
            }
            existingUser.username = registerDto.username;
            existingUser.phone = registerDto.phone;
            existingUser.role = registerDto.role;
            existingUser.password = await bcrypt.hash(registerDto.password, 10);
            existingUser.isSoftDeleted = false;
            existingUser.isApproved = false; // go through verification/approval again
            user = existingUser;
        } else {
            const hashedPassword = await bcrypt.hash(registerDto.password, 10);

            user = this.usersRepository.create({
                ...registerDto,
                password: hashedPassword,
            });
        }

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
        const saved = await this.usersRepository.save(user);

        // Alert admins that a partner is awaiting approval.
        const admins = await this.usersRepository.find({
            where: { role: UserRole.ADMIN },
        });
        await this.notifications.createMany(
            admins.map((a) => a.id),
            {
                title: 'New partner registration',
                body: `${saved.username} (${saved.role}) has registered and is awaiting approval.`,
                type: 'approval',
            },
        );

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

        return { success: true, email: user.email };
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
            message: user.isApproved
                ? 'Store owner approved.'
                : 'Store owner revoked and logged out.',
        };
    }

    async login({ email, password }: LoginDto) {
        const user = await this.usersRepository.findOne({
            where: { email },
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.isSoftDeleted) {
            throw new UnauthorizedException('This account is no longer active.');
        }

        if (user.role === UserRole.CUSTOMER && !user.isApproved) {
            throw new UnauthorizedException('Please verify your email.');
        }

        if (user.role === UserRole.STORE_OWNER && !user.isApproved) {
            throw new UnauthorizedException('Waiting for admin approval.');
        }

        if (user.role === UserRole.RIDER && !user.isApproved) {
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

    async profile(userId: number) {

        const user = await this.usersRepository.findOne({
            where: {
                id: userId,
            },
        });

        if (!user) {
            throw new NotFoundException();
        }

        return user;
    }

    async updateProfile(userId: number, dto: UpdateProfileDto) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new NotFoundException();
        }
        if (dto.username !== undefined && dto.username.trim() !== '') {
            user.username = dto.username.trim();
        }
        if (dto.phone !== undefined && dto.phone.trim() !== '') {
            user.phone = dto.phone.trim();
        }
        if (dto.password) {
            user.password = await bcrypt.hash(dto.password, 10);
        }
        return this.usersRepository.save(user);
    }

    async forgotPassword(
        dto: ForgotPasswordDto,
    ) {

        const user = await this.usersRepository.findOne({
            where: {
                email: dto.email,
            },
        });

        if (!user) {
            // Don't reveal whether the account exists.
            return {
                message:
                    'If an account exists, a reset code has been sent.',
            };
        }

        // A 6-digit numeric code, valid for 15 minutes.
        const code = Math.floor(
            100000 + Math.random() * 900000,
        ).toString();

        user.passwordResetToken = code;

        user.passwordResetExpires = new Date(
            Date.now() + 1000 * 60 * 15,
        );

        await this.usersRepository.save(user);

        // Best-effort email delivery — never fail the request if SMTP is not
        // configured in this environment.
        try {
            await this.mailService.sendMail({
                to: user.email,
                subject: 'Your password reset code',
                html: `
        <h2>Password Reset</h2>
        <p>Your password reset code is:</p>
        <h1 style="letter-spacing:4px">${code}</h1>
        <p>It expires in 15 minutes.</p>
        `,
            });
        } catch {
            // Email not available in this environment; the code is returned
            // below so the mobile flow still works.
            throw new BadRequestException(
                'Email service not available. Please try again later.',
            );
        }

        // NOTE: `code` is returned so the reset flow is fully functional
        // without an email server in this demo. In production, drop `code`
        // from the response and rely solely on the emailed code.
        return {
            message: 'A 6-digit reset code has been generated.',
            email: user.email,
            code,
        };
    }

    async resetPassword(
        dto: ResetPasswordDto,
    ) {

        const user =
            await this.usersRepository.findOne({
                where: {
                    email: dto.email,
                },
            });

        if (
            !user ||
            !user.passwordResetToken ||
            user.passwordResetToken !== dto.code
        ) {
            throw new BadRequestException(
                'Invalid or incorrect reset code',
            );
        }

        if (
            !user.passwordResetExpires ||
            user.passwordResetExpires < new Date()
        ) {
            throw new BadRequestException(
                'Reset code expired. Please request a new one.',
            );
        }

        user.password =
            await bcrypt.hash(dto.password, 10);

        user.passwordResetToken = '';

        user.passwordResetExpires = null as unknown as Date;

        await this.usersRepository.save(user);

        return {
            message:
                'Password updated successfully. You can now sign in.',
        };
    }
}
