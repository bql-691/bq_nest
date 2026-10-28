import '../../features/project/i18n/index.js';
import '../../features/security/i18n/index.js';
import { I18n, resolveLanguage } from './i18n.js';

describe('I18n', () => {
  const i18n = new I18n();

  it('uses Chinese unless the first language tag is English', () => {
    expect(resolveLanguage(undefined)).toBe('zh');
    expect(resolveLanguage('zh-CN,zh;q=0.9')).toBe('zh');
    expect(resolveLanguage('en-US,en;q=0.9')).toBe('en');
  });

  it('translates a feature key and falls back to common', () => {
    expect(i18n.translate('security.err_invalid_credentials', 'zh')).toBe('用户名或密码错误');
    expect(i18n.translate('security.err_invalid_credentials', 'en')).toBe(
      'Incorrect username or password',
    );
    expect(i18n.translate('security.server_error', 'en')).toBe('Server error');
  });
});
