
"use client";

import React, { useState, useEffect, useCallback, useContext } from 'react'; // Added useContext
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, TextQuote, Contrast, Unlock, ListPlus, LanguagesIcon, Save, Loader2, AlertTriangle, Globe, LibraryBig, Accessibility, InfoIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchUserSettingsAction, 
  saveUserSettingsAction,
  type FetchSettingsActionResult,
  type SaveSettingsActionResult
} from '@/app/settingsActions';
import type { NumberOfWordsSetting, AppLanguageSetting, UserSettings } from '@/lib/userSettingsService';
import { TARGET_LANGUAGES, TARGET_FIELDS, LANGUAGES as APP_LANGUAGES_OPTIONS } from '@/constants/data';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { LanguageContext } from '@/contexts/LanguageContext'; // Import LanguageContext
import { useLocalization } from '@/hooks/useLocalization'; // Import useLocalization

const FREE_APP_LANGUAGES: AppLanguageSetting[] = ["en", "ar"];

export default function SettingsPage() {
  const { toast } = useToast();
  const { t, language: currentContextLang, setLanguage: setContextLanguage, isInitialized: localeInitialized } = useLocalization(); // Use localization hook
  const languageContext = useContext(LanguageContext);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pendingNumberOfWords, setPendingNumberOfWords] = useState<NumberOfWordsSetting>(5);
  const [pendingAppLanguage, setPendingAppLanguage] = useState<AppLanguageSetting>("en");
  const [pendingTargetLanguage, setPendingTargetLanguage] = useState<string>("en");
  const [pendingTargetField, setPendingTargetField] = useState<string>("daily_conversation");
  const [pendingEnableAccessibilityAids, setPendingEnableAccessibilityAids] = useState<boolean>(false);
  const [pendingTextSize, setPendingTextSize] = useState("medium"); 
  const [pendingColorContrast, setPendingColorContrast] = useState("default"); 

  const loadUserSettings = useCallback(async (user: User) => {
    setIsLoading(true);
    setError(null);
    const result: FetchSettingsActionResult = await fetchUserSettingsAction({ userId: user.uid });
    if (result.settings) {
      setPendingNumberOfWords(result.settings.numberOfWords);
      setPendingAppLanguage(result.settings.appLanguage);
      setPendingTargetLanguage(result.settings.targetLanguage || "en");
      setPendingTargetField(result.settings.targetField || "daily_conversation");
      setPendingEnableAccessibilityAids(result.settings.enableAccessibilityAids || false);
      // setPendingTextSize(result.settings.textSize || "medium");
      // setPendingColorContrast(result.settings.colorContrast || "default");
    } else if (result.error) {
      setError(result.error);
      toast({ variant: "destructive", title: t('error'), description: result.error });
      setPendingNumberOfWords(5);
      setPendingAppLanguage("en");
      setPendingTargetLanguage("en");
      setPendingTargetField("daily_conversation");
      setPendingEnableAccessibilityAids(false);
    }
    setIsLoading(false);
  }, [toast, t]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        loadUserSettings(user);
      } else {
        setIsLoading(false); 
        setError(t('loginRequiredDescription'));
      }
    });
    return () => unsubscribe();
  }, [loadUserSettings, t]);


  const handleSaveSettings = async () => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to save settings." });
      return;
    }
    setIsSaving(true);
    setError(null);

    const settingsToSave: Partial<UserSettings> = {
      numberOfWords: pendingNumberOfWords,
      appLanguage: pendingAppLanguage,
      targetLanguage: pendingTargetLanguage,
      targetField: pendingTargetField,
      enableAccessibilityAids: pendingEnableAccessibilityAids,
    };

    const result: SaveSettingsActionResult = await saveUserSettingsAction({ userId: currentUser.uid, settings: settingsToSave });

    if (result.success) {
      let titleMessage = t('toastSettingsSavedTitle');
      let descriptionMessage = t('toastSettingsSavedDescription');

      if (settingsToSave.appLanguage) {
        const chosenLang = settingsToSave.appLanguage;
        const isFree = FREE_APP_LANGUAGES.includes(chosenLang);
        const langLabel = APP_LANGUAGES_OPTIONS.find(l => l.value.toLowerCase().startsWith(chosenLang.toLowerCase()))?.label || chosenLang;
        
        if (languageContext) {
           languageContext.setLanguage(chosenLang); // Update context
        }

        if (isFree) {
          // For Arabic or English, the change might be immediate if i18n is fully set up
          // For now, keep conceptual message
          descriptionMessage = t('toastSettingsSavedDescriptionConceptual', { langLabel: langLabel });
        } else {
          descriptionMessage = t('toastSettingsSavedDescriptionPremium', { langLabel: langLabel });
        }
      }
      
      toast({ 
        title: titleMessage, 
        description: descriptionMessage
      });
    } else if (result.error) {
      setError(result.error);
      toast({ variant: "destructive", title: t('error'), description: result.error });
    }
    setIsSaving(false);
  };

  const handleChangePassword = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Password change functionality is not yet implemented.",
      variant: "default",
    });
  };
  
  const targetLanguageDisplayNode = React.useMemo(() => {
    const lang = TARGET_LANGUAGES.find(l => l.value === pendingTargetLanguage);
    return lang ? (
        <div className="flex items-center gap-2">
          {lang.emoji && <span className="text-lg">{lang.emoji}</span>}
          {lang.label}
        </div>
      ) : <SelectValue placeholder={t('settingsSelectTargetLanguage')} />;
  }, [pendingTargetLanguage, t]);

  const appLanguageDisplayNode = React.useMemo(() => {
    // Ensure pendingAppLanguage is valid before finding.
    const validLang = APP_LANGUAGES_OPTIONS.find(l => l.value.toLowerCase().startsWith(pendingAppLanguage?.toLowerCase() || 'en'));
    return validLang ? (
        <div className="flex items-center gap-2">
          {validLang.emoji && <span className="text-lg">{validLang.emoji}</span>}
          {validLang.label}
        </div>
      ) : <SelectValue placeholder={t('settingsSelectAppLanguage')} />;
  }, [pendingAppLanguage, t]);

  if (isLoading || !localeInitialized) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-2xl mx-auto shadow-xl">
          <CardHeader className="items-center text-center">
            <Wrench className="w-12 h-12 text-primary mb-3" />
            <CardTitle className="text-3xl font-bold text-primary">{t('settingsTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">{t('loading')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser && !isLoading) {
     return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-md mx-auto shadow-xl">
          <CardHeader className="items-center text-center">
            <Unlock className="w-12 h-12 text-primary mb-3" />
            <CardTitle className="text-2xl font-bold text-primary">{t('loginRequiredTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{t('loginRequiredDescription')}</p>
            <Button asChild>
              <Link href="/auth/login">{t('goToLoginButton')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader className="items-center text-center">
          <Wrench className="w-12 h-12 text-primary mb-3" />
          <CardTitle className="text-3xl font-bold text-primary">
            {t('settingsTitle')}
          </CardTitle>
          <CardDescription className="text-lg mt-1">
             {t('settingsDescription')} {t('settingsApplyChanges')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {error && (
             <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <p>{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <ListPlus className="w-6 h-6 text-accent me-2" /> {/* Use me-2 for RTL */}
              {t('settingsWordGenerationTitle')}
            </h3>
            <Label htmlFor="num-words-group" className="text-base">{t('settingsNumWordsLabel')}</Label>
            <RadioGroup 
              id="num-words-group"
              value={pendingNumberOfWords.toString()} 
              onValueChange={(value) => setPendingNumberOfWords(parseInt(value) as NumberOfWordsSetting)} 
              className="space-y-2"
              disabled={isSaving}
            >
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <RadioGroupItem value="3" id="nw-3" />
                <Label htmlFor="nw-3" className="font-normal">{t('settings3Words')}</Label>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <RadioGroupItem value="5" id="nw-5" />
                <Label htmlFor="nw-5" className="font-normal">{t('settings5Words')} {t('settingsDefault')}</Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground">
              {t('settingsNumWordsDescription')}
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <Globe className="w-6 h-6 text-accent me-2" />
              {t('settingsTargetLanguageTitle')}
            </h3>
            <Select 
              value={pendingTargetLanguage} 
              onValueChange={(value) => setPendingTargetLanguage(value)}
              disabled={isSaving}
              dir={currentContextLang === 'ar' ? 'rtl' : 'ltr'}
            >
              <SelectTrigger className="w-full sm:w-[320px]">
                {targetLanguageDisplayNode}
              </SelectTrigger>
              <SelectContent>
                {TARGET_LANGUAGES.map(lang => (
                  <SelectItem key={lang.value} value={lang.value}>
                    <div className="flex items-center gap-3 py-1">
                      <span className="text-xl">{lang.emoji}</span>
                      {lang.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {t('settingsTargetLanguageDescription')}
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <LibraryBig className="w-6 h-6 text-accent me-2" />
              {t('settingsTargetFieldTitle')}
            </h3>
            <Select 
              value={pendingTargetField} 
              onValueChange={(value) => setPendingTargetField(value)}
              disabled={isSaving}
              dir={currentContextLang === 'ar' ? 'rtl' : 'ltr'}
            >
              <SelectTrigger className="w-full sm:w-[320px]">
                <SelectValue placeholder={t('settingsSelectTargetField')} />
              </SelectTrigger>
              <SelectContent>
                {TARGET_FIELDS.map(field => (
                  <SelectItem key={field.value} value={field.value}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {t('settingsTargetFieldDescription')}
            </p>
          </div>

          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <Accessibility className="w-6 h-6 text-accent me-2" />
              {t('settingsAccessibilityTitle')}
            </h3>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Checkbox 
                id="enable-accessibility-aids" 
                checked={pendingEnableAccessibilityAids}
                onCheckedChange={(checked) => setPendingEnableAccessibilityAids(checked as boolean)}
                disabled={isSaving}
              />
              <Label htmlFor="enable-accessibility-aids" className="text-base font-normal">
                {t('settingsEnableAccessibilityAidsLabel')}
              </Label>
            </div>
             <p className="text-sm text-muted-foreground flex items-start gap-1.5">
              <InfoIcon className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
              <span>{t('settingsEnableAccessibilityAidsDescription')}</span>
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <LanguagesIcon className="w-6 h-6 text-accent me-2" />
              {t('settingsAppLanguageTitle')}
            </h3>
            <Select 
              value={pendingAppLanguage} 
              onValueChange={(value) => setPendingAppLanguage(value as AppLanguageSetting)}
              disabled={isSaving}
              dir={currentContextLang === 'ar' ? 'rtl' : 'ltr'}
            >
              <SelectTrigger className="w-full sm:w-[280px]">
                 {appLanguageDisplayNode}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English (Default)</SelectItem>
                <SelectItem value="ar">العربية (Arabic)</SelectItem>
                <SelectItem value="es">Español (Spanish - Premium)</SelectItem>
                <SelectItem value="fr">Français (French - Premium)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {t('settingsAppLanguageDescription')}
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <Unlock className="w-6 h-6 text-accent me-2" />
              {t('settingsAccountSecurityTitle')}
            </h3>
            <Button onClick={handleChangePassword} variant="outline" disabled={isSaving}>
              {t('settingsChangePasswordButton')}
            </Button>
            <p className="text-sm text-muted-foreground">
              {t('settingsChangePasswordDescription')} {t('settingsConceptualControl')}
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <TextQuote className="w-6 h-6 text-accent me-2" />
              Text Size (Conceptual)
            </h3>
            <RadioGroup 
              value={pendingTextSize} 
              onValueChange={setPendingTextSize} 
              className="space-y-2"
              disabled={isSaving}
            >
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <RadioGroupItem value="small" id="ts-small" />
                <Label htmlFor="ts-small" className="text-base font-normal">Small</Label>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <RadioGroupItem value="medium" id="ts-medium" />
                <Label htmlFor="ts-medium" className="text-base font-normal">Medium (Default)</Label>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <RadioGroupItem value="large" id="ts-large" />
                <Label htmlFor="ts-large" className="text-base font-normal">Large</Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground">
              Adjust the text size across the application. {t('settingsConceptualControl')}
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <Contrast className="w-6 h-6 text-accent me-2" />
              Color Contrast (Conceptual)
            </h3>
            <RadioGroup 
              value={pendingColorContrast} 
              onValueChange={setPendingColorContrast} 
              className="space-y-2"
              disabled={isSaving}
            >
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <RadioGroupItem value="default" id="cc-default" />
                <Label htmlFor="cc-default" className="text-base font-normal">Default</Label>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <RadioGroupItem value="high-light" id="cc-high-light" />
                <Label htmlFor="cc-high-light" className="text-base font-normal">High Contrast (Light)</Label>
              </div>
               <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <RadioGroupItem value="high-dark" id="cc-high-dark" />
                <Label htmlFor="cc-high-dark" className="text-base font-normal">High Contrast (Dark)</Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground">
              Change the color scheme for better readability. {t('settingsConceptualControl')}
            </p>
          </div>
          
          <Separator />

          <div className="flex flex-col items-center gap-6 mt-8 border-t pt-8">
            <Button 
              onClick={handleSaveSettings} 
              size="lg"
              className="w-full max-w-xs bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3"
              disabled={isSaving || isLoading}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin me-2" /> {t('settingsSavingButton')}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 me-2" /> {t('settingsSaveButton')}
                </>
              )}
            </Button>
            <p className="text-muted-foreground text-sm">
              {t('settingsMoreSettingsSoon')}
            </p>
            <Button asChild variant="outline" disabled={isSaving}>
              <Link href="/">{t('settingsReturnToHomeButton')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    