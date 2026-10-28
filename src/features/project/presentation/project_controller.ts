import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { CurrentUser } from '../../../app/auth/current_user_decorator.js';
import type { Actor } from '../../../app/domain/actor.js';
import { ProjectApplication } from '../application/project_application.js';

@Controller('projects')
export class ProjectController {
  constructor(private application: ProjectApplication) {}

  @Get()
  list(@CurrentUser() actor: Actor) {
    return this.application.list(actor);
  }

  @Get(':id')
  get(@CurrentUser() actor: Actor, @Param('id') id: string) {
    return this.application.get(actor, id);
  }

  @Put(':id')
  save(@CurrentUser() actor: Actor, @Param('id') id: string, @Body() body: unknown) {
    return this.application.save(actor, id, body);
  }
}
