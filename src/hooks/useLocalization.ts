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
    // Type guard to check if the current language is a valid key in our translations object
    const isLangSupported = (lang: string): lang is keyof typeof translations => {
      return lang in translations;
    };

    // Get translations for the current language, or fallback to English if not supported.
    const selectedTranslations = isLangSupported(language) ? translations[language] : translations.en;
    
    // Get the specific text for the key, falling back to English if the key is missing in the selected language,
    // and finally falling back to the key itself if it's not in English either.
    let text = selectedTranslations[key] || translations.en[key] || key;

    if (typeof text === 'function') {
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
