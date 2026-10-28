import type { UserEntity } from '../entities/user_entity.js';

export abstract class IUserRepository {
  abstract findByUsername(username: string): Promise<UserEntity | null>;
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract save(user: UserEntity): Promise<void>;
}
