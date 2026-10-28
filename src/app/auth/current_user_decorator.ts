import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { Actor } from '../domain/actor.js';
import { DomainError } from '../domain/domain_error.js';

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): Actor => {
  const request = ctx.switchToHttp().getRequest<Request & { user?: Actor }>();
  if (!request.user) throw new DomainError(401, 'security.err_unauthenticated');
  return request.user;
});
