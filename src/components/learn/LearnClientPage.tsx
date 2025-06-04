
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
import { TARGET_LANGUAGES, TARGET_FIELDS, SelectionOption } from "@/constants/data"; // Using TARGET_ constants
import { 
  handleGenerateWordSet, 
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

export default function LearnClientPage() {
  const [generatedWordEntries, setGeneratedWordEntries] = useState<WordEntry[]>([]);
  const [isLoadingGeneration, setIsLoadingGeneration] = useState(false); 
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
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
          toast({ variant: "destructive", title: "Could not load settings", description: "Using default values." });
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
  }, [toast]);

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
          setError("Could not load previous word sets: " + result.error);
        }
      } else if (auth.app.options.apiKey === "YOUR_API_KEY_HERE") { 
        // Local storage for test mode (not fully implemented here as primary focus is Firestore)
        console.log("Using local storage for history (test mode) - Not fully implemented for this component with settings dependency.");
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
  }, [currentUser, settingsTargetLanguage, settingsTargetField, isSettingsLoading]);


  useEffect(() => {
    if (!carouselApi) return;
    setCurrentCarouselIndex(carouselApi.selectedScrollSnap());
    carouselApi.on("select", () => setCurrentCarouselIndex(carouselApi.selectedScrollSnap()));
    return () => carouselApi.off("select", () => setCurrentCarouselIndex(carouselApi.selectedScrollSnap()));
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
       toast({ variant: "destructive", title: "Login Required", description: "Please log in to generate and save words." });
       return;
    }
    if (!settingsTargetLanguage || !settingsTargetField) {
      toast({ variant: "destructive", title: "Settings Incomplete", description: "Please set your target language and field in Settings first." });
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
      
      toast({
        title: "New Word Set Generated!",
        description: `A new set of ${result.wordEntries.length} items for ${TARGET_FIELDS.find(f => f.value === result.field)?.label || result.field} in ${TARGET_LANGUAGES.find(l => l.value === result.language)?.label || result.language} is ready.`,
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
          toast({ variant: "destructive", title: "Logging Failed", description: "Could not save activity to your account." });
        }
      } else {
        toast({ title: "Activity Processed Locally", description: "Log in to save progress permanently."});
      }
    } else if (result.error) {
      setError(result.error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: result.error,
      });
    }
  }
  
  const handlePlayWordAudio = (word: string | null) => {
    if (!word) return;
    alert(`Audio playback for "${word}" is not yet implemented.`);
  };

  const handlePlaySentenceAudio = (sentence: string | null) => {
    if(!sentence) return;
    alert(`Audio playback for the sentence "${sentence}" is not yet implemented.`);
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
            <CardTitle className="text-3xl font-bold text-primary">Generate Word Sets</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading your preferences...</p>
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
            <CardTitle className="text-2xl font-bold text-primary">Login Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">Please log in to generate words and save your progress to your account.</p>
            <Button asChild>
              <Link href="/auth/login">Go to Login</Link>
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
            <CardTitle className="text-2xl font-bold text-primary">Set Your Preferences</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Please set your preferred target language and field of knowledge in the 
              <Link href="/settings" className="text-primary underline hover:text-accent"> Settings page</Link> 
              before generating word sets.
            </p>
            <Button asChild>
              <Link href="/settings">Go to Settings</Link>
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
              Word Learning Sets
            </CardTitle>
          </div>
          <CardDescription className="text-center text-lg">
            Generating words for: <strong className="text-primary">{targetLanguageLabel}</strong> in <strong className="text-primary">{targetFieldLabel}</strong>.
            <br />
            {currentUser && (
                <Link href="/settings" className="text-sm underline text-primary hover:text-accent">Change preferences in settings</Link>
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
              Previously Generated Sets
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
                        Generated {formatDistanceToNow(new Date(set.timestamp), { addSuffix: true })} ({set.wordEntries.length} items)
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pt-2 pb-3">
                      <ScrollArea className="h-48 w-full rounded-md border p-3 bg-background">
                        <ul className="space-y-3">
                          {set.wordEntries.map((entry, entryIndex) => (
                            <li key={entryIndex} className="pb-2 border-b last:border-b-0">
                              <div className="flex justify-between items-center">
                                <p className="font-semibold text-foreground">{entry.word}</p>
                                <Button variant="ghost" size="sm" onClick={() => handlePlayWordAudio(entry.word)} aria-label={`Play audio for ${entry.word}`}>
                                  <Volume2 className="w-4 h-4"/>
                                </Button>
                              </div>
                              <div className="flex justify-between items-start mt-1">
                                <p className="text-sm text-muted-foreground flex-grow pr-2">{entry.sentence}</p>
                                <Button variant="ghost" size="sm" onClick={() => handlePlaySentenceAudio(entry.sentence)} aria-label={`Play audio for sentence: ${entry.sentence}`}>
                                  <Volume2 className="w-4 h-4"/>
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
                <AlertTitle>No History Yet</AlertTitle>
                <AlertDescription>No previously generated word sets found for {targetLanguageLabel} - {targetFieldLabel}.</AlertDescription>
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
                Generating New Set...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" /> Generate New {currentWordsToGenerate}-Word Set
              </div>
            )}
          </Button>


          {/* Display newly generated word set */}
          {!isLoadingGeneration && generatedWordEntries.length > 0 && (
            <div className="mt-8 border-t pt-8">
              <h3 className="text-2xl font-semibold mb-4 text-center text-primary flex items-center justify-center gap-2">
                <SpellCheck className="w-7 h-7 text-accent"/> Your Newly Generated Set:
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
                                onClick={() => handlePlayWordAudio(selectedWordEntry.word)}
                                aria-label={`Play audio for ${selectedWordEntry.word}`}
                                className="text-muted-foreground hover:text-primary"
                            >
                                <Volume2 className="w-7 h-7 mr-2" /> Listen to Word
                            </Button>
                        </div>
                    </CardContent>
                  </Card>

                  {selectedWordEntry.sentence && (
                    <div className="mt-4">
                      <h3 className="text-xl font-semibold mb-2 text-center text-primary flex items-center justify-center gap-2">
                        <FileText className="w-6 h-6 text-accent" /> Example Sentence:
                      </h3>
                      <Card className="shadow-md bg-secondary/20">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-lg text-foreground flex-grow">{selectedWordEntry.sentence}</p>
                            <Button variant="ghost" size="icon" onClick={() => handlePlaySentenceAudio(selectedWordEntry.sentence)} aria-label={`Play audio for sentence: ${selectedWordEntry.sentence}`}>
                              <Volume2 className="w-6 h-6 text-muted-foreground hover:text-primary" />
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
              Return to Home Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
