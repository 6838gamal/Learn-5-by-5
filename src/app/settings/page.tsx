
"use client";

import React, { useState, useEffect, useCallback } from 'react';
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

const FREE_APP_LANGUAGES: AppLanguageSetting[] = ["en", "ar"];

export default function SettingsPage() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for pending changes
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
      toast({ variant: "destructive", title: "Error Loading Settings", description: result.error });
      setPendingNumberOfWords(5);
      setPendingAppLanguage("en");
      setPendingTargetLanguage("en");
      setPendingTargetField("daily_conversation");
      setPendingEnableAccessibilityAids(false);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        loadUserSettings(user);
      } else {
        setIsLoading(false); 
        setError("You need to be logged in to manage settings.");
      }
    });
    return () => unsubscribe();
  }, [loadUserSettings]);


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
      let titleMessage = "Settings Saved";
      let descriptionMessage = "Your preferences have been updated.";

      if (Object.keys(settingsToSave).includes('appLanguage') && settingsToSave.appLanguage) {
        const chosenLang = settingsToSave.appLanguage;
        const isFree = FREE_APP_LANGUAGES.includes(chosenLang);
        const langLabel = APP_LANGUAGES_OPTIONS.find(l => l.value.toLowerCase().startsWith(chosenLang.toLowerCase()))?.label || chosenLang;

        if (isFree) {
          descriptionMessage += ` Note: App display language change to ${langLabel} is currently conceptual and will not yet change the interface language.`;
        } else {
          // Premium language chosen
          descriptionMessage = `${langLabel} is a premium feature. Please upgrade to use it as your display language. Your preference has been saved, but the interface language will not change yet.`;
        }
      }
      
      toast({ 
        title: titleMessage, 
        description: descriptionMessage
      });
    } else if (result.error) {
      setError(result.error);
      toast({ variant: "destructive", title: "Error Saving Settings", description: result.error });
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
      ) : <SelectValue placeholder="Select target language..." />;
  }, [pendingTargetLanguage]);

  const appLanguageDisplayNode = React.useMemo(() => {
    const lang = APP_LANGUAGES_OPTIONS.find(l => l.value.toLowerCase().startsWith(pendingAppLanguage.toLowerCase()));
    return lang ? (
        <div className="flex items-center gap-2">
          {lang.emoji && <span className="text-lg">{lang.emoji}</span>}
          {lang.label}
        </div>
      ) : <SelectValue placeholder="Select app language..." />;
  }, [pendingAppLanguage]);


  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-2xl mx-auto shadow-xl">
          <CardHeader className="items-center text-center">
            <Wrench className="w-12 h-12 text-primary mb-3" />
            <CardTitle className="text-3xl font-bold text-primary">Settings</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading your settings...</p>
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
            <CardTitle className="text-2xl font-bold text-primary">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">Please log in to view and manage your settings.</p>
            <Button asChild>
              <Link href="/auth/login">Go to Login</Link>
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
            Settings
          </CardTitle>
          <CardDescription className="text-lg mt-1">
            Customize your LinguaLeap experience. Click "Save Settings" to apply changes.
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
              <ListPlus className="w-6 h-6 mr-2 text-accent" />
              Word Generation
            </h3>
            <Label htmlFor="num-words-group" className="text-base">Number of words per generation:</Label>
            <RadioGroup 
              id="num-words-group"
              value={pendingNumberOfWords.toString()} 
              onValueChange={(value) => setPendingNumberOfWords(parseInt(value) as NumberOfWordsSetting)} 
              className="space-y-2"
              disabled={isSaving}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="nw-3" />
                <Label htmlFor="nw-3" className="font-normal">3 Words</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="nw-5" />
                <Label htmlFor="nw-5" className="font-normal">5 Words (Default)</Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground">
              Choose how many words (each with a sentence) are generated at a time.
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <Globe className="w-6 h-6 mr-2 text-accent" />
              Target Language
            </h3>
            <Select 
              value={pendingTargetLanguage} 
              onValueChange={(value) => setPendingTargetLanguage(value)}
              disabled={isSaving}
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
              Select your primary language for learning new words and phrases.
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <LibraryBig className="w-6 h-6 mr-2 text-accent" />
              Target Field of Knowledge
            </h3>
            <Select 
              value={pendingTargetField} 
              onValueChange={(value) => setPendingTargetField(value)}
              disabled={isSaving}
            >
              <SelectTrigger className="w-full sm:w-[320px]">
                <SelectValue placeholder="Select target field..." />
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
              Choose a specific area or topic you want to focus your vocabulary on.
            </p>
          </div>

          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <Accessibility className="w-6 h-6 mr-2 text-accent" />
              Accessibility
            </h3>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="enable-accessibility-aids" 
                checked={pendingEnableAccessibilityAids}
                onCheckedChange={(checked) => setPendingEnableAccessibilityAids(checked as boolean)}
                disabled={isSaving}
              />
              <Label htmlFor="enable-accessibility-aids" className="text-base font-normal">
                Enable Visual & Text-Based Learning Aids
              </Label>
            </div>
             <p className="text-sm text-muted-foreground flex items-start gap-1.5">
              <InfoIcon className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
              <span>When enabled, the app may provide more visual cues, detailed text descriptions, or alternative ways to interact with content, beneficial for users with hearing impairments or those who prefer text/visual learning. (This is a conceptual control).</span>
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <LanguagesIcon className="w-6 h-6 mr-2 text-accent" />
              App Display Language
            </h3>
            <Select 
              value={pendingAppLanguage} 
              onValueChange={(value) => setPendingAppLanguage(value as AppLanguageSetting)}
              disabled={isSaving}
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
              Choose your preferred display language for the LinguaLeap interface. English and Arabic are free. Other languages are premium features.
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <Unlock className="w-6 h-6 mr-2 text-accent" />
              Account Security
            </h3>
            <Button onClick={handleChangePassword} variant="outline" disabled={isSaving}>
              Change Password
            </Button>
            <p className="text-sm text-muted-foreground">
              Secure your account by updating your password. (This is a conceptual control for now.)
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <TextQuote className="w-6 h-6 mr-2 text-accent" />
              Text Size (Conceptual)
            </h3>
            <RadioGroup 
              value={pendingTextSize} 
              onValueChange={setPendingTextSize} 
              className="space-y-2"
              disabled={isSaving}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="ts-small" />
                <Label htmlFor="ts-small" className="text-base font-normal">Small</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="ts-medium" />
                <Label htmlFor="ts-medium" className="text-base font-normal">Medium (Default)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="ts-large" />
                <Label htmlFor="ts-large" className="text-base font-normal">Large</Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground">
              Adjust the text size across the application. (This is a conceptual control for now)
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <Contrast className="w-6 h-6 mr-2 text-accent" />
              Color Contrast (Conceptual)
            </h3>
            <RadioGroup 
              value={pendingColorContrast} 
              onValueChange={setPendingColorContrast} 
              className="space-y-2"
              disabled={isSaving}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="default" id="cc-default" />
                <Label htmlFor="cc-default" className="text-base font-normal">Default</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high-light" id="cc-high-light" />
                <Label htmlFor="cc-high-light" className="text-base font-normal">High Contrast (Light)</Label>
              </div>
               <div className="flex items-center space-x-2">
                <RadioGroupItem value="high-dark" id="cc-high-dark" />
                <Label htmlFor="cc-high-dark" className="text-base font-normal">High Contrast (Dark)</Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground">
              Change the color scheme for better readability. (This is a conceptual control for now)
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
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" /> Save Settings
                </>
              )}
            </Button>
            <p className="text-muted-foreground text-sm">
              More settings for exercise timers and notifications will be available here soon.
            </p>
            <Button asChild variant="outline" disabled={isSaving}>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
