
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TARGET_LANGUAGES, TARGET_FIELDS } from "@/constants/data"; 
import { 
  handleGenerateWordSet, 
  handleGenerateAudio, // Import audio action
  type GenerateWordSetActionResult,
  logWordSetActivityAction,
  fetchUserActivitiesAction,
  type FetchUserActivitiesResult
} from "@/app/actions";
import { 
  type WordEntry,
  type WordSetActivityRecord
} from "@/lib/activityStore";
import { 
  getNumberOfWordsSettingAction, 
  getTargetLanguageSettingAction, 
  getTargetFieldSettingAction 
} from '@/app/settingsActions';
import type { NumberOfWordsSetting } from '@/lib/userSettingsService';
import { useToast } from "@/hooks/use-toast";
import { Wand2, AlertTriangle, Languages, Lightbulb, Volume2, FileText, SpellCheck, BookOpenText, Home, Loader2, Unlock, History, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useLocalization } from "@/hooks/useLocalization"; // Import the hook
import { ar as arLocale, enUS as enLocale } from 'date-fns/locale';

export default function LearnClientPage() {
  const [generatedWordEntries, setGeneratedWordEntries] = useState<WordEntry[]>([]);
  const [isLoadingGeneration, setIsLoadingGeneration] = useState(false); 
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { t, language: currentLang } = useLocalization(); // Use the localization hook
  const dateLocale = currentLang === 'ar' ? arLocale : enLocale;
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>()
  const [currentCarouselIndex, setCurrentCarouselIndex] = React.useState(0)
  const [selectedWordEntry, setSelectedWordEntry] = useState<WordEntry | null>(null);
  const [splitWordView, setSplitWordView] = useState<string[]>([]);
  
  const [currentWordsToGenerate, setCurrentWordsToGenerate] = useState<NumberOfWordsSetting>(5);
  const [settingsTargetLanguage, setSettingsTargetLanguage] = useState<string | undefined>();
  const [settingsTargetField, setSettingsTargetField] = useState<string | undefined>();
  const [previousWordSets, setPreviousWordSets] = useState<WordSetActivityRecord[]>([]);

  // Effect to load user settings
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsSettingsLoading(true);
      if (user) {
        try {
          const [numWords, targetLang, targetFld] = await Promise.all([
            getNumberOfWordsSettingAction(user.uid),
            getTargetLanguageSettingAction(user.uid),
            getTargetFieldSettingAction(user.uid)
          ]);
          setCurrentWordsToGenerate(numWords);
          setSettingsTargetLanguage(targetLang);
          setSettingsTargetField(targetFld);
        } catch (e) {
          console.error("Failed to load user settings:", e);
          toast({ variant: "destructive", title: t('error'), description: "Could not load settings" });
          setCurrentWordsToGenerate(5); // Default fallback
        }
      } else {
        // For non-logged-in users, reset or use app-wide defaults if any.
        setCurrentWordsToGenerate(5); 
        setSettingsTargetLanguage(undefined);
        setSettingsTargetField(undefined);
      }
      setIsSettingsLoading(false);
    });
    return () => unsubscribe();
  }, [toast, t]);

  // Effect to load previous word sets (history) based on loaded settings
  useEffect(() => {
    if (isSettingsLoading || !settingsTargetLanguage || !settingsTargetField) {
      setPreviousWordSets([]);
      setIsHistoryLoading(false); // Ensure history loading stops if settings aren't ready
      return;
    }

    const loadHistory = async () => {
      setIsHistoryLoading(true);
      setError(null);
      let fetchedSets: WordSetActivityRecord[] = [];

      if (currentUser) {
        const result: FetchUserActivitiesResult = await fetchUserActivitiesAction({ userId: currentUser.uid });
        if (result.activities) {
          fetchedSets = result.activities
            .filter((act): act is WordSetActivityRecord => 
              act.type === 'wordSet' && 
              act.language === settingsTargetLanguage && 
              act.field === settingsTargetField
            )
            .sort((a, b) => b.timestamp - a.timestamp);
        } else if (result.error) {
          setError(t('error') + ": " + result.error);
        }
      } 
      setPreviousWordSets(fetchedSets);
      setIsHistoryLoading(false);
    };

    if (currentUser) { // Only load history if user is logged in and settings are available
      loadHistory();
    } else {
      setPreviousWordSets([]); // Clear history for logged-out users
      setIsHistoryLoading(false);
    }
  }, [currentUser, settingsTargetLanguage, settingsTargetField, isSettingsLoading, t]);


  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const onSelect = () => {
      setCurrentCarouselIndex(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", onSelect);
    onSelect(); // Set initial value

    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (generatedWordEntries.length > 0 && currentCarouselIndex < generatedWordEntries.length) {
      setSelectedWordEntry(generatedWordEntries[currentCarouselIndex]);
    } else {
      setSelectedWordEntry(null);
    }
  }, [currentCarouselIndex, generatedWordEntries]);

  useEffect(() => {
    if (selectedWordEntry) {
      setSplitWordView(selectedWordEntry.word.split(""));
    } else {
      setSplitWordView([]);
    }
  }, [selectedWordEntry]);


  const onGenerateNewSet = async () => {
    if (!currentUser && auth.app.options.apiKey !== "YOUR_API_KEY_HERE") {
       toast({ variant: "destructive", title: t('loginRequiredTitle'), description: t('wordsToastLoginRequired') });
       return;
    }
    if (!settingsTargetLanguage || !settingsTargetField) {
      toast({ variant: "destructive", title: t('wordsToastSettingsIncompleteTitle'), description: t('wordsToastSettingsIncompleteDescription') });
      return;
    }

    setIsLoadingGeneration(true);
    setError(null);
    setGeneratedWordEntries([]);
    setSelectedWordEntry(null);
    setSplitWordView([]);
    setCurrentCarouselIndex(0);
    if (carouselApi) carouselApi.scrollTo(0, true); 

    const result: GenerateWordSetActionResult = await handleGenerateWordSet({
      language: settingsTargetLanguage,
      field: settingsTargetField,
      count: currentWordsToGenerate,
    });

    setIsLoadingGeneration(false);

    if (result.wordEntries && result.wordEntries.length > 0 && result.language && result.field) {
      setGeneratedWordEntries(result.wordEntries);
      if (result.wordEntries.length > 0) setSelectedWordEntry(result.wordEntries[0]); 
      
      const fieldLabel = TARGET_FIELDS.find(f => f.value === result.field)?.label || result.field;
      const langLabel = TARGET_LANGUAGES.find(l => l.value === result.language)?.label || result.language;

      toast({
        title: t('wordsToastSuccessTitle'),
        description: t('wordsToastSuccessDescription', { count: result.wordEntries.length, field: fieldLabel, lang: langLabel }),
      });

      const newActivityRecord: WordSetActivityRecord = {
        id: Date.now().toString(), 
        type: 'wordSet',
        language: result.language,
        field: result.field,
        wordEntries: result.wordEntries,
        timestamp: Date.now() 
      };
      // Add to the top of the displayed history
      setPreviousWordSets(prev => [newActivityRecord, ...prev].sort((a,b) => b.timestamp - a.timestamp));

      if (currentUser) {
        const logResult = await logWordSetActivityAction({
          userId: currentUser.uid,
          language: result.language,
          field: result.field,
          wordEntries: result.wordEntries,
        });
        if (!logResult.success) {
          toast({ variant: "destructive", title: t('wordsToastLoggingFailedTitle'), description: t('wordsToastLoggingFailedDescription') });
        }
      } else {
        toast({ title: t('wordsToastLocalSaveTitle'), description: t('wordsToastLocalSaveDescription')});
      }
    } else if (result.error) {
      setError(result.error);
      toast({
        variant: "destructive",
        title: t('wordsToastGenerationFailedTitle'),
        description: result.error,
      });
    }
  }
  
  const handlePlayAudio = async (text: string | null) => {
    if (!text) return;
    if (audioLoading) return; // Prevent multiple requests

    setAudioLoading(text);
    try {
      const result = await handleGenerateAudio(text);
      if (result.audioDataUri) {
        const audio = new Audio(result.audioDataUri);
        audio.play();
        // Set loading to null only after audio finishes or errors
        audio.onended = () => setAudioLoading(null);
        audio.onerror = (e) => {
          console.error("Audio playback error:", e);
          toast({
            variant: "destructive",
            title: "Playback Error",
            description: "Failed to play the generated audio.",
          });
          setAudioLoading(null);
        };
      } else {
        toast({
          variant: "destructive",
          title: "Audio Generation Failed",
          description: result.error || "Could not generate audio for the selected text.",
        });
        setAudioLoading(null); // Reset loading state on generation failure
      }
    } catch (e) {
      console.error("Failed to generate or play audio:", e);
      toast({
        variant: "destructive",
        title: "Playback Error",
        description: "An unexpected error occurred while trying to play the audio.",
      });
      setAudioLoading(null); // Reset loading state on catch
    }
  };


  const handleGoToHome = () => router.push("/");
  
  const targetLanguageLabel = TARGET_LANGUAGES.find(l => l.value === settingsTargetLanguage)?.label || settingsTargetLanguage;
  const targetFieldLabel = TARGET_FIELDS.find(f => f.value === settingsTargetField)?.label || settingsTargetField;

  if (isSettingsLoading) {
     return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-2xl mx-auto shadow-xl">
          <CardHeader className="items-center text-center">
            <BookOpenText className="w-10 h-10 text-primary mb-3" />
            <CardTitle className="text-3xl font-bold text-primary">{t('wordsTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">{t('wordsLoadingPreferences')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!currentUser && auth.app.options.apiKey !== "YOUR_API_KEY_HERE") {
     return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-md mx-auto shadow-xl">
          <CardHeader className="items-center text-center">
            <Unlock className="w-12 h-12 text-primary mb-3" />
            <CardTitle className="text-2xl font-bold text-primary">{t('loginRequiredTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{t('wordsLoginRequiredDescription')}</p>
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
            <Settings className="w-10 h-10 text-primary mb-3" />
            <CardTitle className="text-2xl font-bold text-primary">{t('wordsSetPreferencesPromptTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {t('wordsSetPreferencesPromptDescriptionPart1')}{' '}
              <Link href="/settings" className="text-primary underline hover:text-accent">
                {t('wordsSetPreferencesPromptLinkText')}
              </Link>{' '}
              {t('wordsSetPreferencesPromptDescriptionPart2')}
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
    <div className="container mx-auto py-8 px-4 md:px-0">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-center mb-2">
            <BookOpenText className="w-10 h-10 text-primary mr-3" />
            <CardTitle className="text-3xl font-bold text-center text-primary">
              {t('wordsTitle')}
            </CardTitle>
          </div>
          <CardDescription className="text-center text-lg">
            {t('wordsGeneratingForLabel', { lang: targetLanguageLabel || '', field: targetFieldLabel || '' })}
            <br />
            {currentUser && (
                <Link href="/settings" className="text-sm underline text-primary hover:text-accent">{t('wordsChangePreferencesLink')}</Link>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
           {error && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}

          {/* Display previous word sets */}
           <div className="mt-2 border-t pt-6">
            <h3 className="text-xl font-semibold mb-3 text-primary flex items-center gap-2">
              <History className="w-6 h-6 text-accent" />
              {t('wordsPreviouslyGeneratedTitle')}
            </h3>
            {isHistoryLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : previousWordSets.length > 0 ? (
              <Accordion type="multiple" className="w-full">
                {previousWordSets.map((set, index) => (
                  <AccordionItem value={`item-${index}`} key={set.id || index}>
                    <AccordionTrigger className="text-base hover:bg-muted/50 px-3 py-3 rounded-md">
                        {t('wordsAccordionTriggerLabel', { date: formatDistanceToNow(new Date(set.timestamp), { addSuffix: true, locale: dateLocale }), count: set.wordEntries.length })}
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pt-2 pb-3">
                      <ScrollArea className="h-48 w-full rounded-md border p-3 bg-background">
                        <ul className="space-y-3">
                          {set.wordEntries.map((entry, entryIndex) => (
                            <li key={entryIndex} className="pb-2 border-b last:border-b-0">
                              <div className="flex justify-between items-center">
                                <p className="font-semibold text-foreground">{entry.word}</p>
                                <Button variant="ghost" size="sm" onClick={() => handlePlayAudio(entry.word)} disabled={!!audioLoading} aria-label={`Play audio for ${entry.word}`}>
                                  {audioLoading === entry.word ? <Loader2 className="w-4 h-4 animate-spin"/> : <Volume2 className="w-4 h-4"/>}
                                </Button>
                              </div>
                              <div className="flex justify-between items-start mt-1">
                                <p className="text-sm text-muted-foreground flex-grow pr-2">{entry.sentence}</p>
                                <Button variant="ghost" size="sm" onClick={() => handlePlayAudio(entry.sentence)} disabled={!!audioLoading} aria-label={`Play audio for sentence: ${entry.sentence}`}>
                                  {audioLoading === entry.sentence ? <Loader2 className="w-4 h-4 animate-spin"/> : <Volume2 className="w-4 h-4"/>}
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <Alert variant="default" className="bg-secondary/30">
                <AlertTriangle className="h-4 w-4 text-primary"/>
                <AlertTitle>{t('wordsAlertNoHistoryTitle')}</AlertTitle>
                <AlertDescription>{t('wordsAlertNoHistory', { lang: targetLanguageLabel || '', field: targetFieldLabel || '' })}</AlertDescription>
              </Alert>
            )}
          </div>

          <Button 
            onClick={onGenerateNewSet}
            disabled={isLoadingGeneration || isSettingsLoading || !settingsTargetLanguage || !settingsTargetField} 
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6 rounded-lg shadow-md transition-transform hover:scale-105 mt-6"
          >
            {isLoadingGeneration ? (
              <div className="flex items-center">
                <Loader2 className="animate-spin h-5 w-5 mr-2"></Loader2>
                {t('wordsGeneratingNewSetButton')}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" /> {t('wordsGenerateNewSetButton', { count: currentWordsToGenerate })}
              </div>
            )}
          </Button>


          {/* Display newly generated word set */}
          {!isLoadingGeneration && generatedWordEntries.length > 0 && (
            <div className="mt-8 border-t pt-8">
              <h3 className="text-2xl font-semibold mb-4 text-center text-primary flex items-center justify-center gap-2">
                <SpellCheck className="w-7 h-7 text-accent"/> {t('wordsYourNewSetTitle')}
              </h3>
              <Carousel setApi={setCarouselApi} className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto mb-6">
                <CarouselContent>
                  {generatedWordEntries.map((entry, index) => (
                    <CarouselItem key={index}>
                      <Card className="shadow-md bg-gradient-to-br from-background to-secondary/30">
                        <CardContent className="flex aspect-square items-center justify-center p-6">
                          <span className="text-3xl font-semibold text-primary">{entry.word}</span>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
              
              {selectedWordEntry && (
                <>
                  <Card className="mt-4 mb-6 shadow-lg p-4 bg-card">
                    <CardHeader className="p-2 pb-0 text-center">
                        <CardTitle className="text-4xl font-bold text-primary break-all">{selectedWordEntry.word}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                        <div className="flex justify-center items-center my-3 space-x-1">
                        {splitWordView.map((letter, index) => (
                            <span 
                            key={index} 
                            className="flex items-center justify-center w-8 h-10 sm:w-10 sm:h-12 bg-muted text-foreground border border-border rounded-md text-lg sm:text-xl font-medium shadow-sm"
                            >
                            {letter}
                            </span>
                        ))}
                        </div>
                        <div className="text-center">
                            <Button 
                                variant="ghost" 
                                size="lg" 
                                onClick={() => handlePlayAudio(selectedWordEntry.word)}
                                aria-label={`Play audio for ${selectedWordEntry.word}`}
                                disabled={!!audioLoading}
                                className="text-muted-foreground hover:text-primary"
                            >
                                {audioLoading === selectedWordEntry.word ? <Loader2 className="w-7 h-7 mr-2 animate-spin"/> : <Volume2 className="w-7 h-7 mr-2" />}
                                {t('wordsListenToWordButton')}
                            </Button>
                        </div>
                    </CardContent>
                  </Card>

                  {selectedWordEntry.sentence && (
                    <div className="mt-4">
                      <h3 className="text-xl font-semibold mb-2 text-center text-primary flex items-center justify-center gap-2">
                        <FileText className="w-6 h-6 text-accent" /> {t('wordsExampleSentenceTitle')}
                      </h3>
                      <Card className="shadow-md bg-secondary/20">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-lg text-foreground flex-grow">{selectedWordEntry.sentence}</p>
                            <Button variant="ghost" size="icon" onClick={() => handlePlayAudio(selectedWordEntry.sentence)} disabled={!!audioLoading} aria-label={`Play audio for sentence: ${selectedWordEntry.sentence}`}>
                              {audioLoading === selectedWordEntry.sentence ? <Loader2 className="w-6 h-6 animate-spin"/> : <Volume2 className="w-6 h-6 text-muted-foreground hover:text-primary" />}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
            
          <div className="mt-12 text-center border-t pt-8">
            <Button 
              onClick={handleGoToHome} 
              variant="outline"
              className="text-lg py-3 px-6 rounded-lg shadow-sm transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              {t('settingsReturnToHomeButton')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
