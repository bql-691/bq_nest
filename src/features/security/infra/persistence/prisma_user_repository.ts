import { Injectable } from '@nestjs/common';
import { DomainError } from '../../../../app/domain/domain_error.js';
import { PrismaService } from '../../../../app/prisma/prisma_service.js';
import { UserEntity } from '../../domain/entities/user_entity.js';
import { IUserRepository } from '../../domain/repositories/i_user_repository.js';

@Injectable()
export class PrismaUserRepository extends IUserRepository {
  constructor(private prisma: PrismaService) {
    super();
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const record = await this.prisma.user.findUnique({ where: { username } });
    return record ? toUser(record) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? toUser(record) : null;
  }

  async save(user: UserEntity): Promise<void> {
    const roles = JSON.stringify(user.roles);
    try {
      await this.prisma.user.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          username: user.username,
          passwordHash: user.passwordHash,
          roles,
        },
        update: {
          username: user.username,
          passwordHash: user.passwordHash,
          roles,
        },
      });
    } catch (error) {
      if (isUniqueConflict(error)) throw new DomainError(409, '用户名已存在');
      throw error;
    }
  }
}

function toUser(record: {
  id: string;
  username: string;
  passwordHash: string;
  roles: string;
}): UserEntity {
  return new UserEntity(record.id, record.username, record.passwordHash, parseRoles(record.roles));
}

function parseRoles(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
      return parsed;
    }
  } catch {
    return ['user'];
  }
  return ['user'];
}

function isUniqueConflict(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
}
