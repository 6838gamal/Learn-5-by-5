
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MessageCircle, Languages, ListChecks, AlertTriangle, Wand2, Loader2, Unlock, Settings as SettingsIcon, Home, Volume2 } from "lucide-react";
import { 
  getActivityData as getActivityDataLocal, 
  addConversationActivity as addConversationActivityLocal,
  type WordSetActivityRecord 
} from "@/lib/activityStore";
import { TARGET_LANGUAGES } from "@/constants/data";
import { 
  handleGenerateConversation, 
  handleGenerateAudio, // Import the audio action
  type GenerateConversationActionResult,
  logConversationActivityAction,
  fetchUserActivitiesAction 
} from "@/app/actions";
import { getTargetLanguageSettingAction } from '@/app/settingsActions';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useLocalization } from '@/hooks/useLocalization';

export default function ConversationsPage() {
  const [isClient, setIsClient] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [settingsTargetLanguage, setSettingsTargetLanguage] = useState<string | undefined>();
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false); // For initial word list fetch

  const [languageWords, setLanguageWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [generatedConversation, setGeneratedConversation] = useState<string | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false); // State for audio loading
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLocalization();

  // Load user settings (target language)
  useEffect(() => {
    setIsClient(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsSettingsLoading(true);
      if (user) {
        try {
          const targetLang = await getTargetLanguageSettingAction(user.uid);
          setSettingsTargetLanguage(targetLang);
        } catch (e) {
          console.error("Failed to load user settings for Conversations page:", e);
          toast({ variant: "destructive", title: "Could not load settings", description: "Please try again or set your preferences in Settings." });
        }
      } else {
        setSettingsTargetLanguage(undefined);
      }
      setIsSettingsLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);

  const loadWordsForLanguage = useCallback(async (language: string, user: User | null) => {
    if (!isClient || !language) {
      setLanguageWords([]);
      setSelectedWords([]);
      setIsDataLoading(false);
      return;
    }
    
    setIsDataLoading(true);
    let wordsSet = new Set<string>();

    if (user) { 
      const result = await fetchUserActivitiesAction({ userId: user.uid });
      if (result.activities) {
        result.activities.forEach(record => {
          if (record.type === 'wordSet' && record.language === language) {
            (record as WordSetActivityRecord).wordEntries.forEach(entry => wordsSet.add(entry.word));
          }
        });
      } else if (result.error) {
        setError("Could not load your learned words. Using local data if available.");
      }
    } else if (auth.app.options.apiKey !== "YOUR_API_KEY_HERE") { 
        // No words for non-logged in users when Firebase is configured
    } else { 
      const activityData = getActivityDataLocal();
      activityData.learnedItems.forEach(record => {
        if (record.type === 'wordSet' && record.language === language) {
          (record as WordSetActivityRecord).wordEntries.forEach(entry => wordsSet.add(entry.word));
        }
      });
    }

    setLanguageWords(Array.from(wordsSet).sort());
    setSelectedWords([]); 
    setGeneratedConversation(null); 
    setError(null);
    setIsDataLoading(false);
  }, [isClient]);

  useEffect(() => {
    if (isClient && !isSettingsLoading && settingsTargetLanguage) {
        loadWordsForLanguage(settingsTargetLanguage, currentUser);
    } else if (isClient && !isSettingsLoading && !settingsTargetLanguage) {
        setLanguageWords([]);
        setSelectedWords([]);
        setIsDataLoading(false);
    }
  }, [isClient, isSettingsLoading, settingsTargetLanguage, currentUser, loadWordsForLanguage]);


  const handleWordSelection = (word: string) => {
    setSelectedWords(prev =>
      prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]
    );
  };

  const onGenerateConversation = async () => {
    if (!settingsTargetLanguage || selectedWords.length < 2) {
      setError(t('conversationsErrorSelectWords'));
      return;
    }
    setIsLoadingConversation(true);
    setError(null);
    setGeneratedConversation(null);

    const result: GenerateConversationActionResult = await handleGenerateConversation({
      language: settingsTargetLanguage,
      selectedWords: selectedWords,
    });

    setIsLoadingConversation(false);

    if (result.conversation && result.language && result.selectedWords) {
      setGeneratedConversation(result.conversation);
      toast({
        title: "Conversation Generated!",
        description: "Your new conversation is ready.",
      });

      if (currentUser) {
        const logResult = await logConversationActivityAction({
          userId: currentUser.uid,
          language: result.language,
          selectedWords: result.selectedWords,
          conversation: result.conversation,
        });
        if (!logResult.success) {
          toast({ variant: "destructive", title: "Logging Failed", description: "Could not save conversation to your account."});
        }
      } else if (auth.app.options.apiKey === "YOUR_API_KEY_HERE"){
         addConversationActivityLocal(result.language, result.selectedWords, result.conversation);
         toast({ title: "Activity Saved Locally", description: "Log in to save progress to your account."});
      }
    } else if (result.error) {
      setError(result.error);
      toast({
        variant: "destructive",
        title: "Conversation Generation Failed",
        description: result.error,
      });
    }
  };

  const handlePlayConversationAudio = async () => {
    if (!generatedConversation) return;
    setIsLoadingAudio(true);
    try {
      const result = await handleGenerateAudio(generatedConversation);
      if (result.audioDataUri) {
        const audio = new Audio(result.audioDataUri);
        audio.play();
      } else {
        toast({
          variant: "destructive",
          title: "Audio Generation Failed",
          description: result.error || "Could not generate audio for the conversation.",
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
      setIsLoadingAudio(false);
    }
  };
  
  const targetLanguageLabel = useMemo(() => {
      const lang = TARGET_LANGUAGES.find(l => l.value === settingsTargetLanguage);
      return lang ? `${lang.emoji} ${lang.label}` : settingsTargetLanguage;
  }, [settingsTargetLanguage]);

  if (!isClient || isSettingsLoading) { 
    return (
       <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-2xl mx-auto shadow-xl">
          <CardHeader className="items-center text-center">
            <MessageCircle className="w-16 h-16 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold text-primary">{t('conversationsTitle')}</CardTitle>
            <CardDescription className="text-lg mt-1">Loading interface...</CardDescription>
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

  if (!isSettingsLoading && !settingsTargetLanguage) {
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
          <MessageCircle className="w-16 h-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold text-primary">
            {t('conversationsTitle')}
          </CardTitle>
          <CardDescription className="text-lg mt-1">
            {t('conversationsDescription')}
            <br />
            Practicing in: <strong className="text-primary">{targetLanguageLabel}</strong>.
             {currentUser && (
                <Link href="/settings" className="text-sm underline text-primary hover:text-accent ml-1">({t('wordsChangePreferencesLink')})</Link>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {settingsTargetLanguage && (
            <div>
              <Label className="text-base flex items-center gap-2 mb-2">
                <ListChecks className="w-5 h-5 text-primary" /> {t('conversationsSelectWordsLabel')}
              </Label>
              {isDataLoading ? (
                <div className="h-48 w-full rounded-md border p-4 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : languageWords.length > 0 ? (
                <ScrollArea className="h-48 w-full rounded-md border p-4">
                  <div className="space-y-2">
                    {languageWords.map(word => (
                      <div key={word} className="flex items-center space-x-2">
                        <Checkbox
                          id={`word-${word}`}
                          checked={selectedWords.includes(word)}
                          onCheckedChange={() => handleWordSelection(word)}
                          disabled={isLoadingConversation}
                        />
                        <Label htmlFor={`word-${word}`} className="font-normal text-sm">
                          {word}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <Alert variant="default" className="bg-secondary/30">
                   <AlertTriangle className="h-4 w-4 text-primary" />
                  <AlertTitle>No Words Yet</AlertTitle>
                  <AlertDescription>
                    {t('conversationsAlertNoWords', { langLabel: targetLanguageLabel || settingsTargetLanguage || ''})}
                    <Link href="/words" className="underline hover:text-primary font-medium ml-1">{t('conversationsAlertGoToWords')}</Link>!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <Button
            onClick={onGenerateConversation}
            disabled={isLoadingConversation || !settingsTargetLanguage || selectedWords.length < 2 || isDataLoading || isSettingsLoading}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3"
          >
            {isLoadingConversation ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('conversationsGeneratingButton')}
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" /> {t('conversationsGenerateButton')}
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('error')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {generatedConversation && (
            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-primary">{t('conversationsGeneratedTitle')}</h3>
                <Button variant="outline" size="sm" onClick={handlePlayConversationAudio} disabled={isLoadingAudio}>
                  {isLoadingAudio ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                  <span className="ml-2">Play Audio</span>
                </Button>
              </div>
              <Card className="bg-muted/30">
                <CardContent className="p-4 whitespace-pre-line text-sm">
                  {generatedConversation}
                </CardContent>
              </Card>
            </div>
          )}
          
           <div className="mt-8 text-center border-t pt-6">
            <Button asChild variant="outline">
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" /> {t('settingsReturnToHomeButton')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
