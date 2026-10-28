import type { UserEntity } from './entities/user_entity.js';

export abstract class TokenIssuer {
  abstract issue(user: UserEntity): Promise<string>;
}
