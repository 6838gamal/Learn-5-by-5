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

  // Listen to auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      // If user logs out, reset to default language or potentially last guest setting
      if (!user) {
        const storedLang = localStorage.getItem(EFFECTIVE_LANGUAGE_STORAGE_KEY) as AppLanguageSetting | null;
        _setLanguage(storedLang || 'en'); 
        setIsInitialized(true);
      }
      // If user logs in, fetching will be triggered by currentUser dependency below
    });
    return () => unsubscribe();
  }, []);

  // Fetch initial language for logged-in user or from localStorage
  useEffect(() => {
    const initializeLanguage = async () => {
      let initialLang: AppLanguageSetting = 'en';
      if (currentUser) {
        try {
          const result = await fetchUserSettingsAction({ userId: currentUser.uid });
          if (result.settings?.appLanguage) {
            initialLang = result.settings.appLanguage;
          }
        } catch (error) {
          console.error("Failed to fetch user language settings:", error);
          // Fallback to localStorage or default
          const storedLang = localStorage.getItem(EFFECTIVE_LANGUAGE_STORAGE_KEY) as AppLanguageSetting | null;
          initialLang = storedLang || 'en';
        }
      } else {
        // No user, try localStorage
        const storedLang = localStorage.getItem(EFFECTIVE_LANGUAGE_STORAGE_KEY) as AppLanguageSetting | null;
        initialLang = storedLang || 'en';
      }
      _setLanguage(initialLang);
      localStorage.setItem(EFFECTIVE_LANGUAGE_STORAGE_KEY, initialLang); // Ensure localStorage is synced
      setIsInitialized(true);
    };

    // Only initialize if not already initialized or if user changes (e.g., login/logout)
    // For logout, the auth listener above handles resetting to 'en' or localStorage
    if (currentUser && !isInitialized) {
      initializeLanguage();
    } else if (!currentUser && !isInitialized) { // Handle initial load when no user is logged in yet
      initializeLanguage();
    }

  }, [currentUser, isInitialized]);


  // Update direction and document attribute when language changes
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
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage: setLanguageCallback, isInitialized }}>
      {children}
    </LanguageContext.Provider>
  );
};

    