
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Volume2, Info, BookOpenText, FileText, Languages, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getActivityData, type WordSetActivityRecord, type WordEntry } from "@/lib/activityStore";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label"; // Added import
import { LANGUAGES, type SelectionOption } from "@/constants/data";

interface DisplayableWordSoundEntry {
  word: string;
  sentence: string | null;
}

export default function SoundsPage() {
  const [displayableEntries, setDisplayableEntries] = useState<DisplayableWordSoundEntry[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && selectedLanguage) {
      const activityData = getActivityData();
      const wordSentenceMap = new Map<string, { sentence: string | null, timestamp: number }>();

      activityData.learnedItems.forEach(record => {
        if (record.type === 'wordSet' && record.language === selectedLanguage && record.wordEntries) {
          record.wordEntries.forEach((entry: WordEntry) => {
            if (!wordSentenceMap.has(entry.word) || record.timestamp > (wordSentenceMap.get(entry.word)?.timestamp || 0)) {
              wordSentenceMap.set(entry.word, { sentence: entry.sentence, timestamp: record.timestamp });
            }
          });
        }
      });
      
      const processedEntries: DisplayableWordSoundEntry[] = Array.from(wordSentenceMap.entries()).map(([word, data]) => ({
        word,
        sentence: data.sentence,
      })).sort((a, b) => a.word.localeCompare(b.word));

      setDisplayableEntries(processedEntries);
    } else if (isClient && !selectedLanguage) {
        setDisplayableEntries([]); // Clear entries if no language is selected
    }
  }, [isClient, selectedLanguage]);

  const handlePlayWordAudio = (word: string) => {
    console.log(`Playing audio for word: ${word}`);
    alert(`Audio playback for "${word}" is not yet implemented. This feature will use Text-to-Speech in the future.`);
  };

  const handlePlaySentenceAudio = (sentence: string | null) => {
    if (!sentence) return;
    console.log(`Playing audio for sentence: ${sentence}`);
    alert(`Audio playback for the sentence "${sentence}" is not yet implemented. This feature will use Text-to-Speech in the future.`);
  };
  
  const languageDisplayNode = useMemo(() => {
    if (isClient && selectedLanguage) {
      const lang = LANGUAGES.find(l => l.value === selectedLanguage);
      return lang ? (
        <div className="flex items-center gap-2">
          {lang.emoji && <span className="text-lg">{lang.emoji}</span>}
          {lang.label}
        </div>
      ) : <SelectValue placeholder="Choose a language..." />;
    }
    return <SelectValue placeholder="Choose a language..." />;
  }, [isClient, selectedLanguage]);


  if (!isClient) {
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

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-3xl mx-auto shadow-xl">
        <CardHeader className="items-center text-center">
          <Mic className="w-16 h-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold text-primary">
            {selectedLanguage 
              ? `Sounds in ${LANGUAGES.find(l => l.value === selectedLanguage)?.label || selectedLanguage}` 
              : "Sounds Practice"}
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            {selectedLanguage 
              ? `Practice listening to words and sentences you've learned in ${LANGUAGES.find(l => l.value === selectedLanguage)?.label || selectedLanguage}.`
              : "Select a language to see your learned words and sentences. Click the speaker icon to hear them (feature coming soon)."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="language-select-sounds" className="text-base flex items-center gap-2 mb-2">
              <Languages className="w-5 h-5 text-primary" /> Select Language:
            </Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger id="language-select-sounds">
                {languageDisplayNode}
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(lang => (
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
          </div>

          {!selectedLanguage && (
            <Alert variant="default" className="bg-secondary/30">
                <Info className="h-5 w-5 text-primary" />
                <AlertTitle>Select a Language</AlertTitle>
                <AlertDescription>
                    Please choose a language from the dropdown above to view your learned words and sentences.
                </AlertDescription>
            </Alert>
          )}

          {selectedLanguage && displayableEntries.length > 0 && (
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
          
          {selectedLanguage && displayableEntries.length === 0 && (
             <Alert variant="default" className="bg-secondary/30">
                <AlertTriangle className="h-4 w-4 text-primary" />
                <AlertTitle>No Words Yet for {LANGUAGES.find(l => l.value === selectedLanguage)?.label || selectedLanguage}</AlertTitle>
                <AlertDescription>
                You haven't generated any words in {LANGUAGES.find(l=>l.value === selectedLanguage)?.label || selectedLanguage} yet. 
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

