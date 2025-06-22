
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
    Construction, 
    ChevronLeft, 
    Home, 
    Loader2, 
    AlertTriangle, 
    Unlock, 
    Settings as SettingsIcon,
    Play,
    RotateCcw
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getTargetLanguageSettingAction, getTargetFieldSettingAction } from '@/app/settingsActions';
import { fetchUserActivitiesAction } from '@/app/actions';
import type { WordEntry, WordSetActivityRecord } from '@/lib/activityStore';
import { TARGET_LANGUAGES, TARGET_FIELDS } from '@/constants/data';

// Helper function to convert slug to title
function slugToTitle(slug: string): string {
  if (!slug) return "Exercise";
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

type ExerciseStatus = "idle" | "active" | "complete";

export default function ExerciseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const exerciseNameSlug = typeof params.exerciseName === 'string' ? params.exerciseName : '';
  const exerciseTitle = slugToTitle(exerciseNameSlug);

  const [isClient, setIsClient] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Settings and Data Loading State
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [settingsTargetLanguage, setSettingsTargetLanguage] = useState<string | undefined>();
  const [settingsTargetField, setSettingsTargetField] = useState<string | undefined>();
  const [words, setWords] = useState<WordEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Exercise State
  const [exerciseStatus, setExerciseStatus] = useState<ExerciseStatus>("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResumeDialog, setShowResumeDialog] = useState(false);

  // Load user settings (target language/field)
  useEffect(() => {
    setIsClient(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsSettingsLoading(true);
      if (user) {
        try {
          const [targetLang, targetField] = await Promise.all([
            getTargetLanguageSettingAction(user.uid),
            getTargetFieldSettingAction(user.uid)
          ]);
          setSettingsTargetLanguage(targetLang);
          setSettingsTargetField(targetField);
        } catch (e) {
          console.error("Failed to load user settings for Exercise page:", e);
          toast({ variant: "destructive", title: "Could not load settings", description: "Please try again or set your preferences in Settings." });
        }
      } else {
        setSettingsTargetLanguage(undefined);
        setSettingsTargetField(undefined);
      }
      setIsSettingsLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);
  
  // Fetch words based on settings
  const loadWordsForExercise = useCallback(async (language: string, field: string, user: User | null) => {
    if (!language || !field) {
        setWords([]);
        return;
    }
    
    setIsDataLoading(true);
    setError(null);
    let wordMap = new Map<string, WordEntry>();

    if (user) {
      const result = await fetchUserActivitiesAction({ userId: user.uid });
      if (result.activities) {
        result.activities.forEach(record => {
          if (record.type === 'wordSet' && record.language === language && record.field === field) {
            (record as WordSetActivityRecord).wordEntries.forEach(entry => {
                if (!wordMap.has(entry.word)) {
                    wordMap.set(entry.word, entry);
                }
            });
          }
        });
      } else if (result.error) {
        setError("Could not load your learned words.");
      }
    }
    // No local storage fallback for non-logged-in users, as login is required.
    
    const loadedWords = Array.from(wordMap.values());
    setWords(loadedWords);
    setIsDataLoading(false);

    // After loading words, check for saved progress
    if (loadedWords.length > 0) {
        const savedProgressRaw = localStorage.getItem(`exercise-progress-${exerciseNameSlug}`);
        if (savedProgressRaw) {
            try {
                const savedProgress = JSON.parse(savedProgressRaw);
                if (typeof savedProgress.index === 'number' && savedProgress.index > 0 && savedProgress.index < loadedWords.length) {
                    setCurrentIndex(savedProgress.index);
                    setShowResumeDialog(true); // Show the resume/start over dialog
                } else {
                    startExercise(true); // Invalid saved progress, start over
                }
            } catch {
                startExercise(true); // JSON parsing failed, start over
            }
        } else {
            setExerciseStatus("idle"); // No saved progress, wait for user to start
        }
    }

  }, [exerciseNameSlug]);

  // Effect to trigger word loading when settings are ready
  useEffect(() => {
    if (isClient && !isSettingsLoading && settingsTargetLanguage && settingsTargetField) {
        loadWordsForExercise(settingsTargetLanguage, settingsTargetField, currentUser);
    } else if (isClient && !isSettingsLoading) {
        setWords([]);
        setIsDataLoading(false);
    }
  }, [isClient, isSettingsLoading, settingsTargetLanguage, settingsTargetField, currentUser, loadWordsForExercise]);

  // Save progress to local storage
  useEffect(() => {
    if (exerciseStatus === 'active' && words.length > 0) {
      const progress = { index: currentIndex, timestamp: Date.now() };
      localStorage.setItem(`exercise-progress-${exerciseNameSlug}`, JSON.stringify(progress));
    }
  }, [currentIndex, exerciseStatus, words.length, exerciseNameSlug]);

  const startExercise = (fromBeginning: boolean) => {
    setShowResumeDialog(false);
    if (fromBeginning) {
        setCurrentIndex(0);
        localStorage.removeItem(`exercise-progress-${exerciseNameSlug}`);
    }
    setExerciseStatus("active");
  };
  
  // --- UI Rendering Logic ---

  if (!isClient || isSettingsLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center">
        <Card className="w-full max-w-xl shadow-xl"><CardHeader className="items-center"><Loader2 className="w-12 h-12 text-primary animate-spin" /></CardHeader><CardContent><p className="text-center text-muted-foreground">Loading Exercise...</p></CardContent></Card>
      </div>
    );
  }
  
  if (!currentUser && auth.app.options.apiKey !== "YOUR_API_KEY_HERE") {
     return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-md mx-auto shadow-xl"><CardHeader className="items-center text-center"><Unlock className="w-12 h-12 text-primary mb-3" /><CardTitle className="text-2xl font-bold text-primary">Login Required</CardTitle></CardHeader><CardContent className="text-center space-y-4"><p className="text-muted-foreground">Please log in to access exercises.</p><Button asChild><Link href="/auth/login">Go to Login</Link></Button></CardContent></Card>
      </div>
    );
  }

  if (!isSettingsLoading && (!settingsTargetLanguage || !settingsTargetField)) {
     return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-lg mx-auto shadow-xl"><CardHeader className="items-center text-center"><SettingsIcon className="w-10 h-10 text-primary mb-3" /><CardTitle className="text-2xl font-bold text-primary">Set Your Preferences</CardTitle></CardHeader><CardContent className="text-center space-y-4"><p className="text-muted-foreground">Please set your target language and field in <Link href="/settings" className="text-primary underline hover:text-accent">Settings</Link> to begin an exercise.</p><Button asChild><Link href="/settings">Go to Settings</Link></Button></CardContent></Card>
      </div>
    );
  }

  const renderExerciseContent = () => {
    if (isDataLoading) {
        return <div className="text-center"><Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" /><p className="mt-2 text-muted-foreground">Loading words...</p></div>;
    }
    
    if (words.length === 0 && !isDataLoading) {
        const langLabel = TARGET_LANGUAGES.find(l => l.value === settingsTargetLanguage)?.label || settingsTargetLanguage;
        const fieldLabel = TARGET_FIELDS.find(f => f.value === settingsTargetField)?.label || settingsTargetField;
        return (
            <Alert variant="default" className="bg-secondary/30">
                <AlertTriangle className="h-4 w-4 text-primary" />
                <AlertTitle>No Words Available for {langLabel} - {fieldLabel}</AlertTitle>
                <AlertDescription>
                    You have not generated any words for this combination yet. Please go to the <Link href="/words" className="underline hover:text-primary font-medium">Words section</Link> to generate a new set.
                </AlertDescription>
            </Alert>
        );
    }
    
    if (exerciseStatus === 'active') {
        const currentWord = words[currentIndex];
        return (
            <div className="text-center space-y-6">
                <p className="text-sm text-muted-foreground">Question {currentIndex + 1} of {words.length}</p>
                <div className="p-8 border rounded-lg bg-card-foreground/5 min-h-[150px] flex flex-col justify-center">
                    <p className="text-3xl font-bold text-primary">{currentWord?.word}</p>
                    <p className="text-base text-muted-foreground mt-2">{currentWord?.sentence}</p>
                </div>
                
                <div className="p-4 border rounded-lg bg-muted/20">
                    <Construction className="w-8 h-8 text-amber-500 mx-auto mb-2"/>
                    <p className="text-muted-foreground text-sm">The interactive part of this exercise is under construction. For now, you can navigate through your words.</p>
                </div>

                <div className="flex justify-between items-center">
                    <Button onClick={() => setCurrentIndex(p => Math.max(0, p - 1))} disabled={currentIndex === 0}>Previous</Button>
                    <Button onClick={() => {
                        if (currentIndex === words.length - 1) {
                            setExerciseStatus("complete");
                        } else {
                            setCurrentIndex(p => p + 1)
                        }
                    }}>
                        {currentIndex === words.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                </div>
            </div>
        )
    }

    if (exerciseStatus === 'complete') {
        return (
            <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold text-primary">Exercise Complete!</h3>
                <p className="text-muted-foreground">Great job! You've reviewed all the words.</p>
                <Button onClick={() => startExercise(true)}>
                    <RotateCcw className="mr-2 h-4 w-4"/> Start Over
                </Button>
            </div>
        );
    }

    if (exerciseStatus === 'idle' && words.length > 0 && !isDataLoading) {
      return (
        <div className="text-center">
            <Button onClick={() => startExercise(true)} size="lg">
                <Play className="mr-2 h-5 w-5"/> Start Exercise
            </Button>
        </div>
      );
    }
    
    return null; // Don't render anything while figuring out initial state
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader className="items-center text-center">
          <Construction className="w-16 h-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold text-primary">
            {exerciseTitle}
          </CardTitle>
          {settingsTargetLanguage && settingsTargetField && 
            <CardDescription className="text-lg mt-2">
                Targeting: <span className="font-semibold text-primary">{TARGET_LANGUAGES.find(l => l.value === settingsTargetLanguage)?.label || settingsTargetLanguage}</span> - <span className="font-semibold text-primary">{TARGET_FIELDS.find(f => f.value === settingsTargetField)?.label || settingsTargetField}</span>
            </CardDescription>
          }
        </CardHeader>
        <CardContent className="min-h-[300px] flex flex-col justify-center">
            
            {renderExerciseContent()}

             <AlertDialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Resume Exercise?</AlertDialogTitle>
                    <AlertDialogDescription>
                        We found saved progress for this exercise. Would you like to continue where you left off or start over?
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => startExercise(true)}>
                        <RotateCcw className="mr-2 h-4 w-4"/> Start Over
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={() => startExercise(false)}>
                        <Play className="mr-2 h-4 w-4"/> Resume
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 border-t pt-6">
            <Button onClick={() => router.push('/exercises')} variant="outline" className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Back to Exercises List
            </Button>
            <Button asChild className="flex items-center gap-2">
              <Link href="/">
                <Home className="w-4 h-4" /> Return to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
