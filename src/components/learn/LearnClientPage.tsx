
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { LANGUAGES, FIELDS, type SelectionOption } from "@/constants/data";
import { 
  handleGenerateWordSet, 
  type GenerateWordSetActionResult,
  logWordSetActivityAction,
  fetchUserActivitiesAction, // To fetch previous activities
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
import { Wand2, AlertTriangle, Languages, Lightbulb, Volume2, FileText, SpellCheck, BookOpenText, Home, Loader2, Unlock, History, ChevronDown } from "lucide-react";
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

const learnFormSchema = z.object({
  language: z.string().min(1, "Please select a language."),
  field: z.string().min(1, "Please select a field of knowledge."),
});

type LearnFormValues = z.infer<typeof learnFormSchema>;

export default function LearnClientPage() {
  const [generatedWordEntries, setGeneratedWordEntries] = useState<WordEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false); 
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

  const form = useForm<LearnFormValues>({
    resolver: zodResolver(learnFormSchema),
    defaultValues: { language: "", field: "" },
  });

  const formLanguage = form.watch("language");
  const formField = form.watch("field");

  // Effect to load user settings and set form defaults
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
          if (targetLang) form.setValue("language", targetLang, { shouldValidate: true });
          if (targetFld) form.setValue("field", targetFld, { shouldValidate: true });
        } catch (e) {
          console.error("Failed to load user settings:", e);
          toast({ variant: "destructive", title: "Could not load settings", description: "Using default values." });
          setCurrentWordsToGenerate(5); // Default fallback
        }
      } else {
        setCurrentWordsToGenerate(5); // Default for non-logged-in
        setSettingsTargetLanguage(undefined);
        setSettingsTargetField(undefined);
        // form.reset({ language: "", field: "" }); // Reset form for logged out user
      }
      setIsSettingsLoading(false);
    });
    return () => unsubscribe();
  }, [toast, form]);

  // Effect to load previous word sets (history)
  useEffect(() => {
    if (!formLanguage || !formField || isSettingsLoading) {
      // Don't fetch if form values aren't set or settings are still loading (to use defaults)
      setPreviousWordSets([]);
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
              act.language === formLanguage && 
              act.field === formField
            )
            .sort((a, b) => b.timestamp - a.timestamp);
        } else if (result.error) {
          setError("Could not load previous word sets: " + result.error);
        }
      } else if (auth.app.options.apiKey === "YOUR_API_KEY_HERE") { // Test mode, use local
        // Local storage fetching logic (simplified, you might need to adapt your activityStore)
        // const localActivities = getActivityDataLocal(); 
        // fetchedSets = localActivities.learnedItems.filter...
        console.log("Using local storage for history (test mode) - Not fully implemented for this example");
      }
      setPreviousWordSets(fetchedSets);
      setIsHistoryLoading(false);
    };

    loadHistory();
  }, [currentUser, formLanguage, formField, isSettingsLoading]);


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


  async function onSubmit(data: LearnFormValues) {
    if (!currentUser && auth.app.options.apiKey !== "YOUR_API_KEY_HERE") {
       toast({ variant: "destructive", title: "Login Required", description: "Please log in to generate and save words." });
       return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedWordEntries([]);
    setSelectedWordEntry(null);
    setSplitWordView([]);
    setCurrentCarouselIndex(0);
    if (carouselApi) carouselApi.scrollTo(0, true); 

    let countToGenerate = currentWordsToGenerate; // Use state that was set from settings
    
    const result: GenerateWordSetActionResult = await handleGenerateWordSet({
      ...data,
      count: countToGenerate,
    });

    setIsLoading(false);

    if (result.wordEntries && result.wordEntries.length > 0 && result.language && result.field) {
      setGeneratedWordEntries(result.wordEntries);
      if (result.wordEntries.length > 0) setSelectedWordEntry(result.wordEntries[0]); 
      
      toast({
        title: "New Word Set Generated!",
        description: `A new set of ${result.wordEntries.length} items for ${data.field} in ${data.language} is ready.`,
      });

      const newActivityRecord: WordSetActivityRecord = {
        id: Date.now().toString(), // Temporary ID, Firestore will assign one
        type: 'wordSet',
        language: result.language,
        field: result.field,
        wordEntries: result.wordEntries,
        timestamp: Date.now() 
      };

      if (result.language === formLanguage && result.field === formField) {
        setPreviousWordSets(prev => [newActivityRecord, ...prev].sort((a,b) => b.timestamp - a.timestamp));
      }

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
        // addWordSetActivityLocal(result.language, result.field, result.wordEntries);
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
  
  let languageDisplayNode: React.ReactNode;
  const selectedLanguageValue = form.watch("language");
  languageDisplayNode = LANGUAGES.find((lang: SelectionOption) => lang.value === selectedLanguageValue) ? (
    <div className="flex items-center gap-2">
      <span className="text-xl">{LANGUAGES.find(l => l.value === selectedLanguageValue)?.emoji}</span>
      <span>{LANGUAGES.find(l => l.value === selectedLanguageValue)?.label}</span>
    </div>
  ) : <SelectValue placeholder="Choose a language..." />;
  
  if (isSettingsLoading && auth.app.options.apiKey !== "YOUR_API_KEY_HERE") {
     return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-2xl mx-auto shadow-xl">
          <CardHeader className="items-center text-center">
            <BookOpenText className="w-10 h-10 text-primary mb-3" />
            <CardTitle className="text-3xl font-bold text-primary">Generate Word Sets</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading settings and history...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!currentUser && auth.app.options.apiKey !== "YOUR_API_KEY_HERE" && !isSettingsLoading) {
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
            Select language and field to see your learning history or generate {currentWordsToGenerate} new words with sentences.
            {currentUser && (
                <> (<Link href="/settings" className="underline text-primary hover:text-accent">Change preferences in settings</Link>). </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base flex items-center gap-2"><Languages className="w-5 h-5 text-primary" /> Language</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value)} value={field.value || ""} defaultValue={field.value} disabled={isLoading || isSettingsLoading}>
                          <FormControl>
                            <SelectTrigger>
                              {languageDisplayNode}
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LANGUAGES.map((lang) => (
                              <SelectItem key={lang.value} value={lang.value}>
                                <div className="flex items-center gap-3 py-1">
                                  <span className="text-xl">{lang.emoji}</span>
                                  <div>
                                    <span className="font-medium">{lang.label}</span>
                                    {lang.description && (
                                      <p className="text-xs text-muted-foreground">{lang.description}</p>
                                    )}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                />
                <FormField
                  control={form.control}
                  name="field"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base flex items-center gap-2"><Lightbulb className="w-5 h-5 text-primary"/> Field of Knowledge</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value)} value={field.value || ""} defaultValue={field.value} disabled={isLoading || isSettingsLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a field..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FIELDS.map((fld) => (
                            <SelectItem key={fld.value} value={fld.value}>
                              {fld.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <Button 
                type="submit" 
                disabled={isLoading || isSettingsLoading || !formLanguage || !formField} 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6 rounded-lg shadow-md transition-transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2"></Loader2>
                    Generating New Set...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5" /> Generate New Word Set
                  </div>
                )}
              </Button>
            </form>
          </Form>

          {error && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}

          {/* Display newly generated word set */}
          {!isLoading && generatedWordEntries.length > 0 && (
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

          {/* Display previous word sets */}
           <div className="mt-8 border-t pt-8">
            <h3 className="text-2xl font-semibold mb-4 text-primary flex items-center gap-2">
              <History className="w-7 h-7 text-accent" />
              Previously Generated Sets ({formLanguage && FIELDS.find(f=>f.value === formField)?.label ? 
                `${LANGUAGES.find(l=>l.value === formLanguage)?.label} - ${FIELDS.find(f=>f.value === formField)?.label}` : 'Select Language/Field'})
            </h3>
            {isHistoryLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-12 w-full" />
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
              <p className="text-muted-foreground text-center py-4">
                {formLanguage && formField ? "No previously generated word sets for this language and field." : "Select a language and field to see your history."}
              </p>
            )}
          </div>
            
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

    