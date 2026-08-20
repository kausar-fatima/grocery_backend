import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtUser {
  sub: number;
  email: string;
  role: string;
}

/// Injects the authenticated user (from the JWT) into a handler parameter.
/// Usage: `@CurrentUser() user: JwtUser` or `@CurrentUser('sub') id: number`.
export const CurrentUser = createParamDecorator(
  (data: keyof JwtUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: JwtUser = request.user;
    return data ? user?.[data] : user;
  },
);
