import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { Actor } from '../../../app/domain/actor.js';
import { DomainError } from '../../../app/domain/domain_error.js';
import { PasswordHasher } from '../domain/password_hasher.js';
import { TokenIssuer } from '../domain/token_issuer.js';
import { UserEntity, type PublicUser } from '../domain/entities/user_entity.js';
import { IUserRepository } from '../domain/repositories/i_user_repository.js';

export type LoginResult = {
  token: string;
  user: PublicUser;
};

@Injectable()
export class SecurityApplication {
  constructor(
    private users: IUserRepository,
    private hasher: PasswordHasher,
    private tokens: TokenIssuer,
  ) {}

  async register(input: {
    username: string;
    password: string;
    confirmPassword: string;
  }): Promise<void> {
    const username = input.username.trim();
    if (username.length < 3) {
      throw new DomainError(400, '用户名长度不能少于 3 位');
    }
    if (input.password.length < 6) {
      throw new DomainError(400, '密码长度不能少于 6 位');
    }
    if (input.password !== input.confirmPassword) {
      throw new DomainError(400, '两次输入的密码不一致');
    }

    const existing = await this.users.findByUsername(username);
    if (existing) throw new DomainError(409, '用户名已存在');

    const passwordHash = await this.hasher.hash(input.password);
    await this.users.save(new UserEntity(randomUUID(), username, passwordHash, ['user']));
  }

  async login(input: { username: string; password: string }): Promise<LoginResult> {
    const user = await this.users.findByUsername(input.username.trim());
    const matched = user !== null && (await this.hasher.verify(input.password, user.passwordHash));
    if (!user || !matched) {
      throw new DomainError(401, '用户名或密码错误');
    }

    return {
      token: await this.tokens.issue(user),
      user: user.toPublic(),
    };
  }

  async me(actor: Actor): Promise<PublicUser> {
    const user = await this.users.findById(actor.id);
    if (!user) throw new DomainError(401, '登录已失效');
    return user.toPublic();
  }
}
