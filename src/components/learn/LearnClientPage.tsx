
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
import { handleGenerateWordSet, type GenerateWordSetActionResult } from "@/app/actions";
import { addWordSetActivity, type WordEntry } from "@/lib/activityStore"; // Still used for client-side logging if needed, or will be replaced
import { getNumberOfWordsSettingAction } from '@/app/settingsActions'; // Import Firestore-backed setting getter
import type { NumberOfWordsSetting } from '@/lib/userSettingsService'; // Import type
import { useToast } from "@/hooks/use-toast";
import { Wand2, AlertTriangle, Languages, Lightbulb, Volume2, FileText, SpellCheck, BookOpenText, Home, Loader2, Unlock } from "lucide-react";
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
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

const learnFormSchema = z.object({
  language: z.string().min(1, "Please select a language."),
  field: z.string().min(1, "Please select a field of knowledge."),
});

type LearnFormValues = z.infer<typeof learnFormSchema>;

export default function LearnClientPage() {
  const [generatedWordEntries, setGeneratedWordEntries] = useState<WordEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false); // For AI generation
  const [isSettingsLoading, setIsSettingsLoading] = useState(true); // For loading settings
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>()
  const [currentCarouselIndex, setCurrentCarouselIndex] = React.useState(0)
  const [selectedWordEntry, setSelectedWordEntry] = useState<WordEntry | null>(null);
  const [splitWordView, setSplitWordView] = useState<string[]>([]);
  const [currentWordsToGenerate, setCurrentWordsToGenerate] = useState<NumberOfWordsSetting>(5);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsSettingsLoading(true);
        try {
          const numWords = await getNumberOfWordsSettingAction(user.uid);
          setCurrentWordsToGenerate(numWords);
        } catch (e) {
          console.error("Failed to load number of words setting:", e);
          toast({ variant: "destructive", title: "Could not load settings", description: "Using default word count." });
          // Fallback to default if Firestore fetch fails
          setCurrentWordsToGenerate(5);
        } finally {
          setIsSettingsLoading(false);
        }
      } else {
        // Not logged in, use default or show message
        setCurrentWordsToGenerate(5); // Default for non-logged-in users
        setIsSettingsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [toast]);

  useEffect(() => {
    if (!carouselApi) {
      return
    }
    setCurrentCarouselIndex(carouselApi.selectedScrollSnap()) 
    const onSelect = () => {
      setCurrentCarouselIndex(carouselApi.selectedScrollSnap())
    };
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi])

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


  const form = useForm<LearnFormValues>({
    resolver: zodResolver(learnFormSchema),
    defaultValues: {
      language: "",
      field: "",
    },
  });

  async function onSubmit(data: LearnFormValues) {
    if (!currentUser && auth.app.options.apiKey !== "YOUR_API_KEY_HERE") { // Check if not in test mode without Firebase
       toast({ variant: "destructive", title: "Login Required", description: "Please log in to generate and save words." });
       // Potentially disable form or redirect
       return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedWordEntries([]);
    setSelectedWordEntry(null);
    setSplitWordView([]);
    setCurrentCarouselIndex(0);
    if (carouselApi) {
        carouselApi.scrollTo(0, true); 
    }

    // Fetch current count setting for the logged-in user, or use default
    let countToGenerate = currentWordsToGenerate; // Use state which is updated on auth change
    if (currentUser) {
      try {
        countToGenerate = await getNumberOfWordsSettingAction(currentUser.uid);
      } catch (e) {
        console.error("Failed to fetch count setting during submit, using current state's value:", e);
      }
    }
    
    const result: GenerateWordSetActionResult = await handleGenerateWordSet({
      ...data,
      count: countToGenerate,
    });

    if (result.wordEntries && result.wordEntries.length > 0 && result.language && result.field) {
      setGeneratedWordEntries(result.wordEntries);
      if (result.wordEntries.length > 0) {
        setSelectedWordEntry(result.wordEntries[0]); 
      }
      // TODO: Migrate addWordSetActivity to Firestore if user is logged in.
      // For now, it still uses localStorage.
      if (currentUser) {
        // If you have a Firestore-based activity logger:
        // await logWordSetActivityToFirestore(currentUser.uid, result.language, result.field, result.wordEntries);
        console.log("User is logged in. TODO: Log activity to Firestore.");
         addWordSetActivity(result.language, result.field, result.wordEntries); // Keep local for now or replace
      } else {
        // For non-logged-in users or if Firestore logging isn't ready, use localStorage
        addWordSetActivity(result.language, result.field, result.wordEntries);
      }
      
      toast({
        title: "Word Entries Generated!",
        description: `A new set of ${result.wordEntries.length} items for ${data.field} in ${data.language} is ready.`,
      });
    } else if (result.error) {
      setError(result.error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: result.error,
      });
    }
    setIsLoading(false);
  }
  
  const handlePlayWordAudio = (word: string | null) => {
    if (!word) return;
    console.log(`Playing audio for word: ${word}`);
    alert(`Audio playback for "${word}" is not yet implemented. This feature will use Text-to-Speech in the future.`);
  };

  const handlePlaySentenceAudio = (sentence: string | null) => {
    if(!sentence) return;
    console.log(`Playing audio for sentence: ${sentence}`);
    alert(`Audio playback for the sentence "${sentence}" is not yet implemented. This feature will use Text-to-Speech in the future.`);
  };

  const handleGoToHome = () => {
    router.push("/");
  };

  let languageDisplayNode: React.ReactNode;
  const selectedLanguageValue = form.watch("language");
  if (selectedLanguageValue) {
    const selectedLanguageOption = LANGUAGES.find((lang: SelectionOption) => lang.value === selectedLanguageValue);
    languageDisplayNode = (
      <div className="flex items-center gap-2">
        {selectedLanguageOption?.emoji && <span className="text-xl">{selectedLanguageOption.emoji}</span>}
        <span>{selectedLanguageOption ? selectedLanguageOption.label : "Choose a language..."}</span>
      </div>
    );
  } else {
    languageDisplayNode = <SelectValue placeholder="Choose a language..." />;
  }
  
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
            <p className="mt-4 text-muted-foreground">Loading settings...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If not logged in and Firebase is configured (not in test placeholder mode)
  if (!currentUser && auth.app.options.apiKey !== "YOUR_API_KEY_HERE" && !isSettingsLoading) {
     return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-md mx-auto shadow-xl">
          <CardHeader className="items-center text-center">
            <Unlock className="w-12 h-12 text-primary mb-3" />
            <CardTitle className="text-2xl font-bold text-primary">Login Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">Please log in to generate words and save your progress.</p>
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
              Generate Word Sets
            </CardTitle>
          </div>
          <CardDescription className="text-center text-lg">
            Select language and field to generate {currentWordsToGenerate} words, each with an example sentence.
            {currentUser && ( // Only show link if user is logged in to access settings
                <> (<Link href="/settings" className="underline text-primary hover:text-accent">Change count in settings</Link>)</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base flex items-center gap-2"><Languages className="w-5 h-5 text-primary" /> Language</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""} defaultValue={field.value} disabled={isLoading}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
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

              <Button 
                type="submit" 
                disabled={isLoading || isSettingsLoading} 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6 rounded-lg shadow-md transition-transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2"></Loader2>
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5" /> Generate Content
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
          
          <div className="mt-8">
            {isLoading && ( // This is for AI generation loading
              <div>
                <Skeleton className="h-24 w-full mb-4" /> 
                <Skeleton className="h-12 w-1/2 mx-auto mb-2" /> 
                <Skeleton className="h-8 w-3/4 mx-auto mb-4" /> 
                <div className="mt-6">
                  <Skeleton className="h-8 w-1/3 mb-2" /> 
                  <Skeleton className="h-10 w-full" /> 
                </div>
              </div>
            )}

            {!isLoading && generatedWordEntries.length > 0 && (
              <>
                <h3 className="text-2xl font-semibold mb-4 text-center text-primary flex items-center justify-center gap-2">
                  <SpellCheck className="w-7 h-7 text-accent"/> Your Word Set ({generatedWordEntries.length} items):
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
                          <p className="text-xs text-muted-foreground text-center mt-2">
                              Audio playback is a placeholder. Phonetic breakdown coming soon.
                          </p>
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
                
                <p className="mt-6 text-sm text-muted-foreground text-center">
                  Content generated by AI. Explore meanings and usage!
                </p>

                <div className="mt-8 text-center">
                  <Button 
                    onClick={handleGoToHome} 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 px-6 rounded-lg shadow-md transition-transform hover:scale-105"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Go to Home Page
                  </Button>
                </div>
              </>
            )}
            {!isLoading && generatedWordEntries.length === 0 && !error && ( 
                 <div className="text-center text-muted-foreground mt-8 py-6 border-2 border-dashed rounded-lg">
                    <p className="text-lg">Ready to learn some new words and sentences?</p>
                    <p>Select a language and field, then click "Generate Content".</p>
                 </div>
            )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
