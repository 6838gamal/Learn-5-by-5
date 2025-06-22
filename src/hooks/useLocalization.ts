
// src/hooks/useLocalization.ts
"use client";

import { useContext, useCallback } from 'react';
import { LanguageContext, type LanguageDirection } from '@/contexts/LanguageContext';
import { translations, type Translations } from '@/lib/translations'; // Ensure this path is correct
import type { AppLanguageSetting } from '@/lib/userSettingsService';

interface UseLocalizationOutput {
  t: (key: keyof Translations, replacements?: Record<string, string | number>) => string;
  language: AppLanguageSetting;
  direction: LanguageDirection;
  isInitialized: boolean;
}

export const useLocalization = (): UseLocalizationOutput => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLocalization must be used within a LanguageProvider');
  }

  const { language, direction, isInitialized } = context;

  const t = useCallback((key: keyof Translations, replacements?: Record<string, string | number>): string => {
    let text = translations[language]?.[key] || translations.en[key] || key;

    if (typeof text === 'function') {
        // Type assertion needed here because TS doesn't know 'text' is a function based on keyof Translations alone
        text = (text as (replacements: Record<string, string | number>) => string)(replacements || {});
    } else if (replacements) {
        Object.keys(replacements).forEach(placeholder => {
            const regex = new RegExp(`{{${placeholder}}}`, 'g');
            text = (text as string).replace(regex, String(replacements[placeholder]));
        });
    }
    return text as string;
  }, [language]);

  return { t, language, direction, isInitialized };
};
