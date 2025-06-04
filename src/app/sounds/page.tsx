
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Volume2, Info, BookOpenText, FileText, Languages, Loader2, AlertTriangle, Unlock } from "lucide-react";
import Link from "next/link";
import { 
  getActivityData as getActivityDataLocal, 
  type WordSetActivityRecord, 
  type WordEntry 
} from "@/lib/activityStore";
import { fetchUserActivitiesAction, type FetchUserActivitiesResult } from "@/app/actions"; // Firestore action
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LANGUAGES as APP_LANGUAGES_OPTIONS, type SelectionOption, TARGET_LANGUAGES } from "@/constants/data"; // Use TARGET_LANGUAGES for consistency
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

interface DisplayableWordSoundEntry {
  word: string;
  sentence: string | null;
}

export default function SoundsPage() {
  const [displayableEntries, setDisplayableEntries] = useState<DisplayableWordSoundEntry[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [isLoadingData, setIsLoadingData] = useState(true); // Changed: true by default
  const [error, setError] = useState<string | null>(null);


  const loadSoundEntries = useCallback(async (language: string, user: User | null) => {
    if (!isClient || !language) {
      setDisplayableEntries([]);
      setIsLoadingData(false);
      return;
    }
    setIsLoadingData(true);
    setError(null);
    let processedEntries: DisplayableWordSoundEntry[] = [];

    if (user) { // Logged-in: Fetch from Firestore
      const result: FetchUserActivitiesResult = await fetchUserActivitiesAction({ userId: user.uid });
      if (result.activities) {
        const wordSentenceMap = new Map<string, { sentence: string | null, timestamp: number }>();
        result.activities.forEach(record => {
          if (record.type === 'wordSet' && record.language === language && (record as WordSetActivityRecord).wordEntries) {
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
      }
    } else if (auth.app.options.apiKey !== "YOUR_API_KEY_HERE") {
        // Not logged in, Firebase configured - show empty or prompt to login. Entries will be empty.
        setDisplayableEntries([]);
    }
    else { // Not logged-in & test mode (placeholder API key): Use localStorage
      const activityData = getActivityDataLocal();
      const wordSentenceMap = new Map<string, { sentence: string | null, timestamp: number }>();
      activityData.learnedItems.forEach(record => {
        if (record.type === 'wordSet' && record.language === language && (record as WordSetActivityRecord).wordEntries) {
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
  }, [isClient]);

  useEffect(() => {
    setIsClient(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      // Trigger loading logic once auth state is known, even if no language is selected yet
      // to handle the "login required" screen properly.
      // If a language is already selected, loadSoundEntries will proceed.
      // If not, it will wait for language selection.
      if (selectedLanguage || !user) { // If language selected OR user is null (to show login prompt)
         loadSoundEntries(selectedLanguage, user);
      } else {
         setIsLoadingData(false); // No language and user is present, nothing to load yet.
      }
    });
    return () => unsubscribe();
  }, [selectedLanguage, loadSoundEntries]); // loadSoundEntries is stable
  
  useEffect(() => { 
    if (isClient && selectedLanguage) {
      loadSoundEntries(selectedLanguage, currentUser);
    } else if (isClient && !selectedLanguage) {
      setDisplayableEntries([]);
      setIsLoadingData(false); 
    }
  }, [isClient, selectedLanguage, currentUser, loadSoundEntries]);


  const handlePlayWordAudio = (word: string) => {
    alert(`Audio playback for "${word}" is not yet implemented.`);
  };

  const handlePlaySentenceAudio = (sentence: string | null) => {
    if (!sentence) return;
    alert(`Audio playback for the sentence "${sentence}" is not yet implemented.`);
  };
  
  const languageDisplayNode = useMemo(() => {
    if (isClient && selectedLanguage) {
      const lang = TARGET_LANGUAGES.find(l => l.value === selectedLanguage);
      return lang ? (
        <div className="flex items-center gap-2">
          {lang.emoji && <span className="text-lg">{lang.emoji}</span>}
          {lang.label}
        </div>
      ) : <SelectValue placeholder="Choose a language..." />;
    }
    return <SelectValue placeholder="Choose a language..." />;
  }, [isClient, selectedLanguage]);


  if (!isClient || isLoadingData) { // Show loader if client not ready OR if data is actively loading
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-3xl mx-auto shadow-xl">
          <CardHeader className="items-center">
            <Mic className="w-16 h-16 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold text-center text-primary">
              Sounds Practice
            </CardTitle>
            <CardDescription className="text-center text-lg mt-2">
              Loading interface...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!currentUser && auth.app.options.apiKey !== "YOUR_API_KEY_HERE" && isClient && !isLoadingData) {
     return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-md mx-auto shadow-xl">
          <CardHeader className="items-center text-center">
            <Unlock className="w-12 h-12 text-primary mb-3" />
            <CardTitle className="text-2xl font-bold text-primary">Login Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">Please log in to practice with your learned words saved to your account.</p>
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
      <Card className="w-full max-w-3xl mx-auto shadow-xl">
        <CardHeader className="items-center text-center">
          <Mic className="w-16 h-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold text-primary">
            {selectedLanguage 
              ? `Sounds in ${TARGET_LANGUAGES.find(l => l.value === selectedLanguage)?.label || selectedLanguage}` 
              : "Sounds Practice"}
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            {selectedLanguage 
              ? `Practice listening to words and sentences you've learned in ${TARGET_LANGUAGES.find(l => l.value === selectedLanguage)?.label || selectedLanguage}.`
              : "Select a language to see your learned words and sentences. Click the speaker icon to hear them (feature coming soon)."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="language-select-sounds" className="text-base flex items-center gap-2 mb-2">
              <Languages className="w-5 h-5 text-primary" /> Select Language:
            </Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={isLoadingData}>
              <SelectTrigger id="language-select-sounds">
                {languageDisplayNode}
              </SelectTrigger>
              <SelectContent>
                {TARGET_LANGUAGES.map(lang => (
                  <SelectItem key={lang.value} value={lang.value}>
                    <div className="flex items-center gap-3 py-1">
                      <span className="text-xl">{lang.emoji}</span>
                      <div>
                        <span className="font-medium">{lang.label}</span>
                        {/* Description removed for TARGET_LANGUAGES as it's not in the constant structure */}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {error && <Alert variant="destructive" className="mb-4"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

          {!selectedLanguage && !isLoadingData && (
            <Alert variant="default" className="bg-secondary/30">
                <Info className="h-5 w-5 text-primary" />
                <AlertTitle>Select a Language</AlertTitle>
                <AlertDescription>
                    Please choose a language from the dropdown above to view your learned words and sentences.
                </AlertDescription>
            </Alert>
          )}
          
          {/* Loader inside content area, only if language is selected and still loading */}
          {isLoadingData && selectedLanguage && (
            <div className="h-[400px] flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          )}

          {!isLoadingData && selectedLanguage && displayableEntries.length > 0 && (
            <>
              <Alert className="mb-6 bg-secondary/30">
                <Info className="h-5 w-5 text-primary" />
                <AlertTitle className="font-semibold text-primary">Practice Tip</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                  Listen carefully. Try to repeat aloud. Generate more in the <Link href="/words" className="underline hover:text-primary">Words section</Link>.
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
                          onClick={() => handlePlayWordAudio(entry.word)}
                          aria-label={`Play audio for ${entry.word}`}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Volume2 className="w-5 h-5" />
                        </Button>
                      </div>
                      {entry.sentence && (
                        <div className="pl-3 border-l-2 border-accent/50 w-full space-y-1 pt-2 pb-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <FileText className="w-3 h-3"/>
                            Example sentence:
                          </p>
                          <div className="flex items-center justify-between w-full">
                            <p className="text-sm text-foreground flex-1 mr-2">{entry.sentence}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePlaySentenceAudio(entry.sentence)}
                              aria-label={`Play audio for sentence: ${entry.sentence}`}
                              className="text-muted-foreground hover:text-primary shrink-0"
                            >
                              <Volume2 className="w-5 h-5" />
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
          
          {!isLoadingData && selectedLanguage && displayableEntries.length === 0 && !error && (
             <Alert variant="default" className="bg-secondary/30">
                <AlertTriangle className="h-4 w-4 text-primary" />
                <AlertTitle>No Words Yet for {TARGET_LANGUAGES.find(l => l.value === selectedLanguage)?.label || selectedLanguage}</AlertTitle>
                <AlertDescription>
                You haven't generated any words in {TARGET_LANGUAGES.find(l=>l.value === selectedLanguage)?.label || selectedLanguage} yet. 
                Go to the <Link href="/words" className="underline hover:text-primary font-medium">Words section</Link> to add some!
                </AlertDescription>
            </Alert>
          )}

          <div className="mt-8 text-center border-t pt-6">
            <Button asChild variant="outline">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
