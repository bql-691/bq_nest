import i18n from 'i18next';
import { zhCN as commonZh } from './locales/zh_cn.js';
import { enUS as commonEn } from './locales/en_us.js';

type Messages = Record<string, unknown>;

const bundles: Record<'zh' | 'en', Record<string, Messages>> = {
  zh: { common: commonZh },
  en: { common: commonEn },
};

export const registerMessages = (feature: string, locales: { zh: Messages; en: Messages }) => {
  bundles.zh[feature] = locales.zh;
  bundles.en[feature] = locales.en;
  if (!i18n.isInitialized) return;
  i18n.addResourceBundle('zh', 'translation', { [feature]: locales.zh }, true, true);
  i18n.addResourceBundle('en', 'translation', { [feature]: locales.en }, true, true);
};

export const buildResources = () => ({
  zh: { translation: bundles.zh },
  en: { translation: bundles.en },
});
