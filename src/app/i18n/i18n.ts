import { Injectable } from '@nestjs/common';
import i18n from 'i18next';
import { buildResources } from './catalog.js';

export type Language = 'zh' | 'en';

export function resolveLanguage(header: string | string[] | undefined): Language {
  const raw = Array.isArray(header) ? header[0] : header;
  const tag = raw?.split(',')[0]?.trim().toLowerCase() ?? '';
  if (tag.startsWith('en')) return 'en';
  return 'zh';
}

function ensureI18n(): void {
  if (i18n.isInitialized) return;
  void i18n.init({
    resources: buildResources(),
    lng: 'zh',
    fallbackLng: 'zh',
    interpolation: { escapeValue: false },
    parseMissingKeyHandler(key: string, _defaultValue: unknown, options?: { lng?: string }) {
      const dot = key.indexOf('.');
      if (dot <= 0) return key;
      if (key.slice(0, dot) === 'common') return key;
      const commonKey = `common.${key.slice(dot + 1)}`;
      const lng = options?.lng;
      return i18n.exists(commonKey, { lng }) ? String(i18n.t(commonKey, { lng })) : key;
    },
  });
}

@Injectable()
export class I18n {
  constructor() {
    ensureI18n();
  }

  translate(key: string, language: Language = 'zh'): string {
    ensureI18n();
    return String(i18n.t(key, { lng: language }));
  }

  translateMessage(message: string, language: Language = 'zh'): string {
    return message
      .split('; ')
      .map((part) => this.translate(part, language))
      .join('; ');
  }
}
