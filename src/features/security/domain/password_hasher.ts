export abstract class PasswordHasher {
  abstract hash(plain: string): Promise<string>;
  abstract verify(plain: string, passwordHash: string): Promise<boolean>;
}
