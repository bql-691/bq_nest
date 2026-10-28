import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenIssuer } from '../domain/token_issuer.js';
import type { UserEntity } from '../domain/entities/user_entity.js';

@Injectable()
export class JwtTokenIssuer extends TokenIssuer {
  constructor(private jwt: JwtService) {
    super();
  }

  issue(user: UserEntity): Promise<string> {
    return this.jwt.signAsync({
      sub: user.id,
      username: user.username,
      roles: user.roles,
    });
  }
}
