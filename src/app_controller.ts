import { Controller, Get } from '@nestjs/common';
import { Public } from './app/auth/public_decorator.js';

@Controller()
export class AppController {
  @Public()
  @Get('health')
  health(): { status: string } {
    return { status: 'ok' };
  }
}
