import { Transform } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(3, { message: 'security.err_username_length' })
  username!: string;

  @IsString()
  @MinLength(6, { message: 'security.err_password_length' })
  password!: string;

  @IsString()
  @MinLength(6, { message: 'security.err_password_length' })
  confirmPassword!: string;
}
