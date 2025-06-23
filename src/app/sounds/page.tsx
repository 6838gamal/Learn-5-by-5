
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Volume2, Info, BookOpenText, FileText, Languages, Loader2, AlertTriangle, Unlock, Settings as SettingsIcon, LibraryBig } from "lucide-react";
import Link from "next/link";
import { 
  getActivityData as getActivityDataLocal, 
  type WordSetActivityRecord, 
  type WordEntry 
} from "@/lib/activityStore";
import { 
  fetchUserActivitiesAction, 
  type FetchUserActivitiesResult,
  handleGenerateAudio,
} from "@/app/actions"; // Firestore action
import { getTargetLanguageSettingAction, getTargetFieldSettingAction } from '@/app/settingsActions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from "@/components/ui/label";
import { TARGET_LANGUAGES, TARGET_FIELDS } from "@/constants/data"; 
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/hooks/useLocalization';

interface DisplayableWordSoundEntry {
  word: string;
  sentence: string | null;
}

export default function SoundsPage() {
  const [displayableEntries, setDisplayableEntries] = useState<DisplayableWordSoundEntry[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [settingsTargetLanguage, setSettingsTargetLanguage] = useState<string | undefined>();
  const [settingsTargetField, setSettingsTargetField] = useState<string | undefined>();
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false); // For data fetching after settings are loaded
  const [audioLoading, setAudioLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLocalization();

  // Load user settings
  useEffect(() => {
    setIsClient(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsSettingsLoading(true);
      if (user) {
        try {
          const [targetLang, targetFld] = await Promise.all([
            getTargetLanguageSettingAction(user.uid),
            getTargetFieldSettingAction(user.uid)
          ]);
          setSettingsTargetLanguage(targetLang);
          setSettingsTargetField(targetFld);
        } catch (e) {
          console.error("Failed to load user settings for Sounds page:", e);
          toast({ variant: "destructive", title: "Could not load settings", description: "Please try again or set your preferences in Settings." });
        }
      } else {
        // Clear settings for non-logged-in users or if login is required by config
        setSettingsTargetLanguage(undefined);
        setSettingsTargetField(undefined);
      }
      setIsSettingsLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);


  const loadSoundEntries = useCallback(async () => {
    if (!isClient || !settingsTargetLanguage || !settingsTargetField) {
      setDisplayableEntries([]);
      setIsLoadingData(false);
      return;
    }
    
    setIsLoadingData(true);
    setError(null);
    let processedEntries: DisplayableWordSoundEntry[] = [];

    if (currentUser) { // Logged-in: Fetch from Firestore
      const result: FetchUserActivitiesResult = await fetchUserActivitiesAction({ userId: currentUser.uid });
      if (result.activities) {
        const wordSentenceMap = new Map<string, { sentence: string | null, timestamp: number }>();
        result.activities.forEach(record => {
          if (record.type === 'wordSet' && 
              record.language === settingsTargetLanguage && 
              record.field === settingsTargetField && 
              (record as WordSetActivityRecord).wordEntries) {
            (record as WordSetActivityRecord).wordEntries.forEach((entry: WordEntry) => {
              if (!wordSentenceMap.has(entry.word) || record.timestamp > (wordSentenceMap.get(entry.word)?.timestamp || 0)) {
                wordSentenceMap.set(entry.word, { sentence: entry.sentence, timestamp: record.timestamp });
              }
            });
          }
        });
        processedEntries = Array.from(wordSentenceMap.entries()).map(([word, data]) => ({
          word, sentence: data.sentence,
        })).sort((a, b) => a.word.localeCompare(b.word));
      } else if (result.error) {
        setError(`Failed to load sound entries: ${result.error}`);
        toast({ variant: "destructive", title: "Error Loading Sounds", description: result.error});
      }
    } else if (auth.app.options.apiKey !== "YOUR_API_KEY_HERE") {
        setDisplayableEntries([]);
    }
    else { // Not logged-in & test mode (placeholder API key): Use localStorage
      const activityData = getActivityDataLocal();
      const wordSentenceMap = new Map<string, { sentence: string | null, timestamp: number }>();
      activityData.learnedItems.forEach(record => {
        if (record.type === 'wordSet' && 
            record.language === settingsTargetLanguage && 
            record.field === settingsTargetField && 
            (record as WordSetActivityRecord).wordEntries) {
          (record as WordSetActivityRecord).wordEntries.forEach((entry: WordEntry) => {
            if (!wordSentenceMap.has(entry.word) || record.timestamp > (wordSentenceMap.get(entry.word)?.timestamp || 0)) {
              wordSentenceMap.set(entry.word, { sentence: entry.sentence, timestamp: record.timestamp });
            }
          });
        }
      });
      processedEntries = Array.from(wordSentenceMap.entries()).map(([word, data]) => ({
        word, sentence: data.sentence,
      })).sort((a, b) => a.word.localeCompare(b.word));
    }
    setDisplayableEntries(processedEntries);
    setIsLoadingData(false);
  }, [isClient, settingsTargetLanguage, settingsTargetField, currentUser, toast]);
  
  useEffect(() => { 
    if (isClient && !isSettingsLoading && settingsTargetLanguage && settingsTargetField) {
      loadSoundEntries();
    } else if (isClient && !isSettingsLoading && (!settingsTargetLanguage || !settingsTargetField)) {
      // If settings are loaded but language/field is not set, clear entries and stop loading data
      setDisplayableEntries([]);
      setIsLoadingData(false); 
    }
  }, [isClient, isSettingsLoading, settingsTargetLanguage, settingsTargetField, currentUser, loadSoundEntries]);


  const handlePlayAudio = async (text: string | null) => {
    if (!text) return;
    if (audioLoading) return; // Prevent multiple requests at once

    setAudioLoading(text);
    try {
      const result = await handleGenerateAudio(text);
      if (result.audioDataUri) {
        const audio = new Audio(result.audioDataUri);
        audio.play();
      } else {
        toast({
          variant: "destructive",
          title: "Audio Generation Failed",
          description: result.error || "Could not generate audio for the selected text.",
        });
      }
    } catch (e) {
      console.error("Failed to play audio:", e);
      toast({
        variant: "destructive",
        title: "Playback Error",
        description: "An unexpected error occurred while trying to play the audio.",
      });
    } finally {
      setAudioLoading(null);
    }
  };
  
  const targetLanguageLabel = TARGET_LANGUAGES.find(l => l.value === settingsTargetLanguage)?.label || settingsTargetLanguage;
  const targetFieldLabel = TARGET_FIELDS.find(f => f.value === settingsTargetField)?.label || settingsTargetField;


  if (!isClient || isSettingsLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-3xl mx-auto shadow-xl">
          <CardHeader className="items-center text-center">
            <Mic className="w-16 h-16 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold text-primary">{t('navSounds')}</CardTitle>
            <CardDescription className="text-lg mt-2">{t('soundsLoadingPreferences')}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!currentUser && auth.app.options.apiKey !== "YOUR_API_KEY_HERE" && isClient && !isSettingsLoading) {
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
  
  if (!isSettingsLoading && (!settingsTargetLanguage || !settingsTargetField)) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-lg mx-auto shadow-xl">
          <CardHeader className="items-center text-center">
            <SettingsIcon className="w-10 h-10 text-primary mb-3" />
            <CardTitle className="text-2xl font-bold text-primary">{t('wordsSetPreferencesPromptTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {t('wordsSetPreferencesPromptDescription')}
            </p>
            <Button asChild>
              <Link href="/settings">{t('wordsGoToSettingsButton')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-3xl mx-auto shadow-xl">
        <CardHeader className="items-center text-center">
          <Mic className="w-16 h-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold text-primary">
            {t('soundsTitle', { language: targetLanguageLabel })}
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            {t('soundsDescription', { field: targetFieldLabel })}
             <br />
            {currentUser && (
                <Link href="/settings" className="text-sm underline text-primary hover:text-accent">{t('wordsChangePreferencesLink')}</Link>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <Alert variant="destructive" className="mb-4"><AlertTriangle className="h-4 w-4" /><AlertTitle>{t('error')}</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
          
          {isLoadingData && (
            <div className="h-[400px] flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">{t('loading')}</p>
            </div>
          )}

          {!isLoadingData && displayableEntries.length > 0 && (
            <>
              <Alert className="mb-6 bg-secondary/30">
                <Info className="h-5 w-5 text-primary" />
                <AlertTitle className="font-semibold text-primary">{t('soundsPracticeTipTitle')}</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                  {t('soundsPracticeTipDescription')} <Link href="/words" className="underline hover:text-primary">{t('navGenerateWords')}</Link>.
                </AlertDescription>
              </Alert>
              <ScrollArea className="h-[400px] pr-3">
                <ul className="space-y-4">
                  {displayableEntries.map((entry) => (
                    <li
                      key={entry.word}
                      className="p-4 bg-card border rounded-lg shadow-sm hover:bg-muted/50 transition-colors flex flex-col items-start gap-3"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xl font-semibold text-primary">{entry.word}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePlayAudio(entry.word)}
                          aria-label={`Play audio for ${entry.word}`}
                          disabled={!!audioLoading}
                          className="text-muted-foreground hover:text-primary"
                        >
                          {audioLoading === entry.word ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
                        </Button>
                      </div>
                      {entry.sentence && (
                        <div className="pl-3 border-l-2 border-accent/50 w-full space-y-1 pt-2 pb-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <FileText className="w-3 h-3"/>
                            {t('wordsExampleSentenceTitle')}
                          </p>
                          <div className="flex items-center justify-between w-full">
                            <p className="text-sm text-foreground flex-1 mr-2">{entry.sentence}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePlayAudio(entry.sentence)}
                              aria-label={`Play audio for sentence: ${entry.sentence}`}
                              disabled={!!audioLoading}
                              className="text-muted-foreground hover:text-primary shrink-0"
                            >
                              {audioLoading === entry.sentence ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
                            </Button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </>
          )}
          
          {!isLoadingData && displayableEntries.length === 0 && !error && (
             <Alert variant="default" className="bg-secondary/30">
                <AlertTriangle className="h-4 w-4 text-primary" />
                <AlertTitle>{t('soundsNoWordsTitle', { langLabel: targetLanguageLabel, fieldLabel: targetFieldLabel })}</AlertTitle>
                <AlertDescription>
                {t('soundsNoWordsDescription')}
                <Link href="/words" className="underline hover:text-primary font-medium">{t('navGenerateWords')}</Link>!
                </AlertDescription>
            </Alert>
          )}

          <div className="mt-8 text-center border-t pt-6">
            <Button asChild variant="outline">
              <Link href="/">{t('settingsReturnToHomeButton')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
