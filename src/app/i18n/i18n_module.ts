import { Module } from '@nestjs/common';
import { I18n } from './i18n.js';

@Module({
  providers: [I18n],
  exports: [I18n],
})
export class I18nModule {}
