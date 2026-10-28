import { Transform } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(3, { message: '用户名长度不能少于 3 位' })
  username!: string;

  @IsString()
  @MinLength(6, { message: '密码长度不能少于 6 位' })
  password!: string;
}
