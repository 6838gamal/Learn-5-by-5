
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, TextQuote, Contrast, Unlock, ListPlus, LanguagesIcon, Save } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  getNumberOfWordsSetting, 
  setNumberOfWordsSetting,
  getAppLanguageSetting,
  setAppLanguageSetting,
  type NumberOfWordsSetting,
  type AppLanguageSetting
} from '@/lib/settingsStore';

export default function SettingsPage() {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  // State for current settings (loaded from store)
  const [currentNumberOfWords, setCurrentNumberOfWords] = useState<NumberOfWordsSetting>(5);
  const [currentAppLanguage, setCurrentAppLanguage] = useState<AppLanguageSetting>("en");
  
  // State for pending changes (updated by UI controls)
  const [pendingNumberOfWords, setPendingNumberOfWords] = useState<NumberOfWordsSetting>(5);
  const [pendingAppLanguage, setPendingAppLanguage] = useState<AppLanguageSetting>("en");
  const [pendingTextSize, setPendingTextSize] = useState("medium"); // Conceptual
  const [pendingColorContrast, setPendingColorContrast] = useState("default"); // Conceptual

  useEffect(() => {
    setIsClient(true);
    const initialNumWords = getNumberOfWordsSetting();
    const initialAppLang = getAppLanguageSetting();

    setCurrentNumberOfWords(initialNumWords);
    setPendingNumberOfWords(initialNumWords);

    setCurrentAppLanguage(initialAppLang);
    setPendingAppLanguage(initialAppLang);

    // Initialize conceptual settings if they were ever stored or have defaults
    // For now, they just reset to default on load as they are conceptual
    setPendingTextSize("medium"); 
    setPendingColorContrast("default");

  }, []);

  const handleSaveSettings = () => {
    if (!isClient) return;

    setNumberOfWordsSetting(pendingNumberOfWords);
    setCurrentNumberOfWords(pendingNumberOfWords); // Update current display state

    setAppLanguageSetting(pendingAppLanguage);
    setCurrentAppLanguage(pendingAppLanguage); // Update current display state
    
    // For conceptual settings, we can just log or acknowledge them
    console.log("Conceptual Text Size setting:", pendingTextSize);
    console.log("Conceptual Color Contrast setting:", pendingColorContrast);

    toast({ 
      title: "Settings Saved", 
      description: `Preferences have been updated. Number of words: ${pendingNumberOfWords}. App language: ${pendingAppLanguage} (conceptual).` 
    });
  };

  const handleChangePassword = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Password change functionality is not yet implemented.",
      variant: "default",
    });
  };

  if (!isClient) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-2xl mx-auto shadow-xl">
          <CardHeader className="items-center text-center">
            <Wrench className="w-12 h-12 text-primary mb-3" />
            <CardTitle className="text-3xl font-bold text-primary">Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-10 bg-muted rounded w-full"></div>
              <div className="h-8 bg-muted rounded w-1/3 mt-4"></div>
              <div className="h-10 bg-muted rounded w-full"></div>
            </div>
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
              Change the display language of the LinguaLeap interface. (This is a conceptual control for now and does not change the UI language yet.)
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <Unlock className="w-6 h-6 mr-2 text-accent" />
              Account Security
            </h3>
            <Button onClick={handleChangePassword} variant="outline">
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
            >
              <Save className="w-5 h-5 mr-2" />
              Save Settings
            </Button>
            <p className="text-muted-foreground text-sm">
              More settings for exercise timers and notifications will be available here soon.
            </p>
            <Button asChild variant="outline">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

