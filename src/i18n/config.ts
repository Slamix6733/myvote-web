export type Locale = 'en' | 'ko';

export const locales = ['en', 'ko'] as const;
export const defaultLocale: Locale = 'en';