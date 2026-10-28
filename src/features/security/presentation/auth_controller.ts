import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CurrentUser } from '../../../app/auth/current_user_decorator.js';
import { Public } from '../../../app/auth/public_decorator.js';
import type { Actor } from '../../../app/domain/actor.js';
import { SecurityApplication } from '../application/security_application.js';
import { LoginDto } from './dto/login_dto.js';
import { RegisterDto } from './dto/register_dto.js';

@Controller('auth')
export class AuthController {
  constructor(private application: SecurityApplication) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.OK)
  register(@Body() dto: RegisterDto): Promise<void> {
    return this.application.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.application.login(dto);
  }

  @Get('me')
  me(@CurrentUser() actor: Actor) {
    return this.application.me(actor);
  }
}
