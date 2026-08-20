import { Body, Controller, Get, Param, Patch, Post, Request, Res, UseGuards } from '@nestjs/common';
import express from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from '@nestjs/passport';


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('forgot-password')
    forgotPassword(
        @Body() dto: ForgotPasswordDto,
    ) {
        return this.authService.forgotPassword(dto);
    }

    @Post('reset-password')
    resetPassword(
        @Body() dto: ResetPasswordDto,
    ) {
        return this.authService.resetPassword(dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    profile(
        @Request() req,
    ) {
        return this.authService.profile(req.user.sub);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('profile')
    updateProfile(
        @Request() req,
        @Body() dto: UpdateProfileDto,
    ) {
        return this.authService.updateProfile(req.user.sub, dto);
    }
    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Get('verify/:token')
    async verifyEmail(@Param('token') token: string, @Res() res: express.Response) {
        const result = await this.authService.verifyEmail(token);
        res.setHeader('Content-Type', 'text/html');
        res.status(result.success ? 200 : 400).send(
            this.verifyEmailPage(result.success, result.email),
        );
    }

    private verifyEmailPage(success: boolean, email?: string): string {
        const icon = success ? '✅' : '⚠️';
        const heading = success ? 'Email verified' : 'Invalid or expired link';
        const message = success
            ? `${email ?? 'Your account'} has been verified. You can close this tab and sign in.`
            : 'This verification link is invalid or has already been used.';
        const accent = success ? '#53B175' : '#E0413B';
        const accentBg = success ? '#EAF6EE' : '#FDECEB';

        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${heading}</title>
</head>
<body style="margin:0;background:#F7F8FA;font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px;box-sizing:border-box;">
  <div style="max-width:420px;width:100%;background:#FFFFFF;border-radius:20px;padding:36px 28px;box-shadow:0 20px 40px rgba(30,34,43,0.08);text-align:center;border:1px solid #E2E2E2;">
    <div style="width:64px;height:64px;border-radius:16px;background:${accentBg};display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:30px;">
      ${icon}
    </div>
    <h1 style="margin:0 0 10px;font-size:20px;font-weight:600;color:#1E222B;">${heading}</h1>
    <p style="margin:0;font-size:14px;line-height:1.5;color:#7C7C7C;">${message}</p>
  </div>
</body>
</html>`;
    }

    @Patch('store-owner/:id/approval')
    approveStoreOwner(@Param('id') id: string) {
        return this.authService.approveStoreOwner(+id);
    }
}
