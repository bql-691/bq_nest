import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { IS_PUBLIC } from '../../../app/auth/public_decorator.js';
import { Actor } from '../../../app/domain/actor.js';
import { DomainError } from '../../../app/domain/domain_error.js';
import { IUserRepository } from '../domain/repositories/i_user_repository.js';

type AccessTokenPayload = {
  sub?: string;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwt: JwtService,
    private users: IUserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request & { user?: Actor }>();
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new DomainError(401, '未登录');

    const token = header.slice('Bearer '.length).trim();
    if (!token) throw new DomainError(401, '未登录');

    let payload: AccessTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<AccessTokenPayload>(token);
    } catch {
      throw new DomainError(401, '登录已失效');
    }

    if (!payload.sub) throw new DomainError(401, '登录已失效');
    const user = await this.users.findById(payload.sub);
    if (!user) throw new DomainError(401, '登录已失效');

    request.user = new Actor(user.id, user.username, user.roles);
    return true;
  }
}
