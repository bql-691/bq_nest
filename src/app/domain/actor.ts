export class Actor {
  constructor(
    readonly id: string,
    readonly username: string,
    readonly roles: string[],
  ) {}

  hasPermission(permission: string): boolean {
    return this.roles.includes('admin') || this.roles.includes(permission);
  }
}
