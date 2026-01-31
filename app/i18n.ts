import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

const modules = [
  'common',
  'auth',
  'venue',
  'offers',
  'trends',
  'customer',
  'search'
];

async function getMessages(locale: string) {
  const messages: Record<string, any> = {};
  
  for (const module of modules) {
    try {
      // Use explicit path to help bundlers
      const mod = (await import(`../messages/${locale}/${module}.json`)).default;
      Object.assign(messages, mod);
    } catch (err) {
      // Silent catch for missing modules in specific locales
      // common.json is expected to exist
      if (module === 'common') {
        console.error(`CRITICAL: Could not load common.json for locale: ${locale}`);
      }
    }
  }
  
  return messages;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // Load English as base to prevent missing keys
  const englishMessages = await getMessages('en');
  
  if (locale === 'en') {
    return {
      locale,
      messages: englishMessages
    };
  }

  // Load target locale and merge over English
  const localeMessages = await getMessages(locale);
  
  return {
    locale,
    messages: { ...englishMessages, ...localeMessages }
  };
});
