// src/contexts/LanguageContext.tsx
"use client";

import React, { createContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import type { AppLanguageSetting } from '@/lib/userSettingsService'; // Ensure this path is correct
import { fetchUserSettingsAction } from '@/app/settingsActions'; // Action to get settings
import { auth } from '@/lib/firebase'; // Firebase auth
import { onAuthStateChanged, type User } from 'firebase/auth';

export type LanguageDirection = "ltr" | "rtl";

interface LanguageContextType {
  language: AppLanguageSetting;
  direction: LanguageDirection;
  setLanguage: (language: AppLanguageSetting) => void;
  isInitialized: boolean;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const EFFECTIVE_LANGUAGE_STORAGE_KEY = "linguaLeapAppLanguage_effective";

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, _setLanguage] = useState<AppLanguageSetting>('en'); // Default to English
  const [direction, setDirection] = useState<LanguageDirection>('ltr');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Listen to auth changes to update currentUser state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // This will trigger the main language initialization effect below
    });
    return () => unsubscribe();
  }, []); // Runs once to set up the auth listener

  // Effect to initialize or re-initialize language settings when currentUser changes or on first load
  useEffect(() => {
    let didCancel = false; // To prevent state updates if the component unmounts during async operations

    const initializeLanguage = async () => {
      if (didCancel) return;
      setIsInitialized(false); // Set to false during (re)initialization
      let langToSet: AppLanguageSetting = 'en'; // Default fallback

      if (currentUser) {
        try {
          const result = await fetchUserSettingsAction({ userId: currentUser.uid });
          if (!didCancel && result.settings?.appLanguage) {
            langToSet = result.settings.appLanguage;
          }
        } catch (error) {
          console.error("Failed to fetch user language settings:", error);
          // Fallback to localStorage or 'en' if fetching user settings fails
          const storedLang = localStorage.getItem(EFFECTIVE_LANGUAGE_STORAGE_KEY) as AppLanguageSetting | null;
          if (storedLang) langToSet = storedLang;
        }
      } else {
        // No user, try localStorage as a fallback
        const storedLang = localStorage.getItem(EFFECTIVE_LANGUAGE_STORAGE_KEY) as AppLanguageSetting | null;
        if (storedLang) langToSet = storedLang;
      }

      if (!didCancel) {
        _setLanguage(langToSet);
        if (typeof window !== 'undefined') {
          localStorage.setItem(EFFECTIVE_LANGUAGE_STORAGE_KEY, langToSet);
        }
        setIsInitialized(true); // Signal that initialization is complete
      }
    };

    initializeLanguage();

    return () => {
      didCancel = true; // Cleanup on unmount or if currentUser changes triggering a re-run
    };
  }, [currentUser]); // Re-run this effect when currentUser changes

  // Update document direction and lang attribute when language state changes
  useEffect(() => {
    const newDirection = language === 'ar' ? 'rtl' : 'ltr';
    setDirection(newDirection);
    if (typeof window !== 'undefined') {
      document.documentElement.dir = newDirection;
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguageCallback = useCallback((newLang: AppLanguageSetting) => {
    _setLanguage(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(EFFECTIVE_LANGUAGE_STORAGE_KEY, newLang);
      // The useEffect above will handle document.dir and document.lang updates
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage: setLanguageCallback, isInitialized }}>
      {children}
    </LanguageContext.Provider>
  );
};
