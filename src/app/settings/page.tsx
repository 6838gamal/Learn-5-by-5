
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, TextQuote, Contrast, Unlock, ListPlus, LanguagesIcon } from "lucide-react";
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

  const [textSize, setTextSize] = useState("medium"); // Conceptual
  const [colorContrast, setColorContrast] = useState("default"); // Conceptual
  
  const [numberOfWords, setNumberOfWordsState] = useState<NumberOfWordsSetting>(5);
  const [appLanguage, setAppLanguageState] = useState<AppLanguageSetting>("en");

  useEffect(() => {
    setIsClient(true);
    setNumberOfWordsState(getNumberOfWordsSetting());
    setAppLanguageState(getAppLanguageSetting());
  }, []);

  const handleNumberOfWordsChange = (value: string) => {
    const num = parseInt(value, 10) as NumberOfWordsSetting;
    if (num === 3 || num === 5) {
      setNumberOfWordsSetting(num);
      setNumberOfWordsState(num);
      toast({ title: "Setting Saved", description: `Number of words per generation set to ${num}.` });
    }
  };

  const handleAppLanguageChange = (value: AppLanguageSetting) => {
    setAppLanguageSetting(value);
    setAppLanguageState(value);
    toast({ title: "Setting Saved (Conceptual)", description: `App display language set to ${value}. This is a conceptual setting for now.` });
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
            Customize your LinguaLeap experience.
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
              value={numberOfWords.toString()} 
              onValueChange={handleNumberOfWordsChange} 
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
            <Select value={appLanguage} onValueChange={handleAppLanguageChange}>
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
            <RadioGroup value={textSize} onValueChange={setTextSize} className="space-y-2">
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
            <RadioGroup value={colorContrast} onValueChange={setColorContrast} className="space-y-2">
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

          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-6">
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
