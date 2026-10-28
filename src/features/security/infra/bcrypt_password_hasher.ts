import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { PasswordHasher } from '../domain/password_hasher.js';

@Injectable()
export class BcryptPasswordHasher extends PasswordHasher {
  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }

  verify(plain: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(plain, passwordHash);
  }
}
