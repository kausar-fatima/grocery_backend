import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/// Requires a valid JWT. Populates `req.user` with { sub, email, role }.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
