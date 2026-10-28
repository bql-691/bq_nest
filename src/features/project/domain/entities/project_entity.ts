import { Exclude, instanceToPlain, plainToInstance, Transform, Type } from 'class-transformer';
import {
  Equals,
  IsNumber,
  IsString,
  MinLength,
  ValidateNested,
  validate,
  type ValidationError,
} from 'class-validator';
import type { Actor } from '../../../../app/domain/actor.js';
import { DomainError } from '../../../../app/domain/domain_error.js';
import { Document } from './document.js';

export class Project {
  @Equals('project/Project')
  type = 'project/Project' as const;

  @IsString()
  @MinLength(1)
  id!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1, { message: 'project.err_name_empty' })
  name!: string;

  @IsNumber()
  updatedAt!: number;

  @ValidateNested()
  @Type(() => Document)
  document!: Document;

  /** 只存在于服务端，不进入返回给前端的快照。 */
  @Exclude({ toPlainOnly: true })
  ownerId!: string;

  assertAccessible(actor: Actor): void {
    if (this.ownerId === actor.id || actor.hasPermission('project:write')) return;
    throw new DomainError(404, 'project.err_not_found');
  }
}

export async function projectFromClient(
  id: string,
  raw: unknown,
  ownerId: string,
): Promise<Project> {
  if (!raw || typeof raw !== 'object') throw new DomainError(400, 'project.err_invalid');
  const body = raw as Record<string, unknown>;
  if (typeof body.id === 'string' && body.id !== id) {
    throw new DomainError(400, 'project.err_invalid');
  }

  const project = plainToInstance(Project, {
    ...(asTypeRecord(body) as Record<string, unknown>),
    id,
    document: asTypeRecord(body.document ?? { type: 'project/Document', shapes: [] }),
  });
  const errors = await validate(project);
  if (errors.length > 0) throw new DomainError(400, validationMessage(errors));
  project.ownerId = ownerId;
  return project;
}

export function projectFromRecord(record: {
  id: string;
  name: string;
  updatedAt: number;
  document: string;
  ownerId: string;
}): Project {
  return plainToInstance(Project, {
    type: 'project/Project',
    id: record.id,
    name: record.name,
    updatedAt: record.updatedAt,
    ownerId: record.ownerId,
    document: asTypeRecord(JSON.parse(record.document) as unknown),
  });
}

export function plainProject(project: Project): Record<string, unknown> {
  return instanceToPlain(project) as Record<string, unknown>;
}

function asTypeRecord(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(asTypeRecord);
  if (!value || typeof value !== 'object') return value;
  const source = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(source)) {
    if (key.startsWith('$')) continue;
    result[key] = asTypeRecord(item);
  }
  if (typeof result.type !== 'string' && typeof source.$modelType === 'string') {
    result.type = source.$modelType;
  }
  return result;
}

function validationMessage(errors: ValidationError[]): string {
  const messages = flatten(errors);
  return messages.length > 0 ? messages.join('; ') : 'project.err_invalid';
}

function flatten(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => [
    ...Object.values(error.constraints ?? {}),
    ...flatten(error.children ?? []),
  ]);
}
