export type PublicUser = {
  id: string;
  username: string;
  roles: string[];
};

export class UserEntity {
  constructor(
    readonly id: string,
    readonly username: string,
    readonly passwordHash: string,
    readonly roles: string[],
  ) {}

  hasPermission(permission: string): boolean {
    return this.roles.includes('admin') || this.roles.includes(permission);
  }

  toPublic(): PublicUser {
    return {
      id: this.id,
      username: this.username,
      roles: this.roles,
    };
  }
}
