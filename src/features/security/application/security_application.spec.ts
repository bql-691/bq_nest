import { DomainError } from '../../../app/domain/domain_error.js';
import { PasswordHasher } from '../domain/password_hasher.js';
import { TokenIssuer } from '../domain/token_issuer.js';
import { UserEntity } from '../domain/entities/user_entity.js';
import { IUserRepository } from '../domain/repositories/i_user_repository.js';
import { SecurityApplication } from './security_application.js';

class InMemoryUsers extends IUserRepository {
  readonly items: UserEntity[] = [];

  findByUsername(username: string): Promise<UserEntity | null> {
    return Promise.resolve(this.items.find((user) => user.username === username) ?? null);
  }

  findById(id: string): Promise<UserEntity | null> {
    return Promise.resolve(this.items.find((user) => user.id === id) ?? null);
  }

  save(user: UserEntity): Promise<void> {
    this.items.push(user);
    return Promise.resolve();
  }
}

class FakeHasher extends PasswordHasher {
  hash(plain: string): Promise<string> {
    return Promise.resolve(`hashed:${plain}`);
  }

  verify(plain: string, passwordHash: string): Promise<boolean> {
    return Promise.resolve(passwordHash === `hashed:${plain}`);
  }
}

class FakeTokens extends TokenIssuer {
  issue(user: UserEntity): Promise<string> {
    return Promise.resolve(`token:${user.id}`);
  }
}

describe('SecurityApplication', () => {
  it('registers a user and logs in with the same password', async () => {
    const users = new InMemoryUsers();
    const application = new SecurityApplication(users, new FakeHasher(), new FakeTokens());

    await application.register({
      username: 'ada',
      password: 'secret1',
      confirmPassword: 'secret1',
    });
    const result = await application.login({
      username: 'ada',
      password: 'secret1',
    });

    expect(result.token.startsWith('token:')).toBe(true);
    expect(result.user).toEqual({
      id: users.items[0]?.id,
      username: 'ada',
      roles: ['user'],
    });
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('rejects a mismatched confirmation password', async () => {
    const application = new SecurityApplication(
      new InMemoryUsers(),
      new FakeHasher(),
      new FakeTokens(),
    );
    await expect(
      application.register({
        username: 'ada',
        password: 'secret1',
        confirmPassword: 'secret2',
      }),
    ).rejects.toMatchObject({ status: 400, message: 'security.err_password_mismatch' });
  });

  it('rejects a duplicated username', async () => {
    const application = new SecurityApplication(
      new InMemoryUsers(),
      new FakeHasher(),
      new FakeTokens(),
    );
    await application.register({
      username: 'ada',
      password: 'secret1',
      confirmPassword: 'secret1',
    });
    await expect(
      application.register({
        username: 'ada',
        password: 'secret1',
        confirmPassword: 'secret1',
      }),
    ).rejects.toBeInstanceOf(DomainError);
  });

  it('hides whether the username exists when the password is wrong', async () => {
    const users = new InMemoryUsers();
    users.items.push(new UserEntity('1', 'ada', 'hashed:secret1', ['user']));
    const application = new SecurityApplication(users, new FakeHasher(), new FakeTokens());

    await expect(application.login({ username: 'ada', password: 'nope' })).rejects.toMatchObject({
      status: 401,
      message: 'security.err_invalid_credentials',
    });
    await expect(
      application.login({ username: 'missing', password: 'secret1' }),
    ).rejects.toMatchObject({ status: 401, message: 'security.err_invalid_credentials' });
  });
});
