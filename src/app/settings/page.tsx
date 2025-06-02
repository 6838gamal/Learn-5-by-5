
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, TextQuote, Contrast, Unlock, ListPlus, LanguagesIcon, Save, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchUserSettingsAction, 
  saveUserSettingsAction,
  type FetchSettingsActionResult,
  type SaveSettingsActionResult
} from '@/app/settingsActions'; // Updated import
import type { NumberOfWordsSetting, AppLanguageSetting, UserSettings } from '@/lib/userSettingsService'; // Import types
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

export default function SettingsPage() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // For initial load
  const [isSaving, setIsSaving] = useState(false); // For save operation
  const [error, setError] = useState<string | null>(null);

  // State for pending changes (updated by UI controls)
  const [pendingNumberOfWords, setPendingNumberOfWords] = useState<NumberOfWordsSetting>(5);
  const [pendingAppLanguage, setPendingAppLanguage] = useState<AppLanguageSetting>("en");
  const [pendingTextSize, setPendingTextSize] = useState("medium"); // Conceptual
  const [pendingColorContrast, setPendingColorContrast] = useState("default"); // Conceptual

  // Fetch settings when user is available or changes
  const loadUserSettings = useCallback(async (user: User) => {
    setIsLoading(true);
    setError(null);
    const result: FetchSettingsActionResult = await fetchUserSettingsAction({ userId: user.uid });
    if (result.settings) {
      setPendingNumberOfWords(result.settings.numberOfWords);
      setPendingAppLanguage(result.settings.appLanguage);
      // Initialize conceptual settings if they were ever stored or have defaults
      // setPendingTextSize(result.settings.textSize || "medium");
      // setPendingColorContrast(result.settings.colorContrast || "default");
    } else if (result.error) {
      setError(result.error);
      toast({ variant: "destructive", title: "Error Loading Settings", description: result.error });
      // Fallback to defaults on error
      setPendingNumberOfWords(5);
      setPendingAppLanguage("en");
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        loadUserSettings(user);
      } else {
        setIsLoading(false); // Not logged in, no settings to load
        // Optionally redirect or show login message
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

    const settingsToSave: Partial<Pick<UserSettings, 'numberOfWords' | 'appLanguage'>> = {
      numberOfWords: pendingNumberOfWords,
      appLanguage: pendingAppLanguage,
      // conceptual settings if they were to be saved:
      // textSize: pendingTextSize as any, 
      // colorContrast: pendingColorContrast as any,
    };

    const result: SaveSettingsActionResult = await saveUserSettingsAction({ userId: currentUser.uid, settings: settingsToSave });

    if (result.success) {
      toast({ 
        title: "Settings Saved", 
        description: `Preferences have been updated in Firestore. Number of words: ${pendingNumberOfWords}. App language: ${pendingAppLanguage} (conceptual).` 
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
              <LanguagesIcon className="w-6 h-6 mr-2 text-accent" />
              App Display Language
            </h3>
            <Select 
              value={pendingAppLanguage} 
              onValueChange={(value) => setPendingAppLanguage(value as AppLanguageSetting)}
              disabled={isSaving}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select app language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English (Default)</SelectItem>
                <SelectItem value="es">Español (Spanish - Conceptual)</SelectItem>
                <SelectItem value="fr">Français (French - Conceptual)</SelectItem>
                <SelectItem value="ar">العربية (Arabic - Conceptual)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Change the display language of the LinguaLeap interface. (This is a conceptual control.)
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
                <Label htmlFor="ts-small" className="text-base">Small</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="ts-medium" />
                <Label htmlFor="ts-medium" className="text-base">Medium (Default)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="ts-large" />
                <Label htmlFor="ts-large" className="text-base">Large</Label>
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
                <Label htmlFor="cc-default" className="text-base">Default</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high-light" id="cc-high-light" />
                <Label htmlFor="cc-high-light" className="text-base">High Contrast (Light)</Label>
              </div>
               <div className="flex items-center space-x-2">
                <RadioGroupItem value="high-dark" id="cc-high-dark" />
                <Label htmlFor="cc-high-dark" className="text-base">High Contrast (Dark)</Label>
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
