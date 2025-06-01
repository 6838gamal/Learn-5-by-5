
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Volume2, Info, BookOpenText, FileText } from "lucide-react";
import Link from "next/link";
import { getActivityData, type WordSetActivityRecord, type WordEntry } from "@/lib/activityStore";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DisplayableWordSoundEntry {
  word: string;
  sentence: string | null; // Sentence can be null if not found or if a word existed without one
}

export default function SoundsPage() {
  const [displayableEntries, setDisplayableEntries] = useState<DisplayableWordSoundEntry[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      const activityData = getActivityData();
      const wordSentenceMap = new Map<string, { sentence: string | null, timestamp: number }>();

      activityData.learnedItems.forEach(record => {
        if (record.type === 'wordSet' && record.wordEntries) {
          record.wordEntries.forEach((entry: WordEntry) => {
            // If word is new or this record is newer, update/add its sentence
            if (!wordSentenceMap.has(entry.word) || record.timestamp > (wordSentenceMap.get(entry.word)?.timestamp || 0)) {
              wordSentenceMap.set(entry.word, { sentence: entry.sentence, timestamp: record.timestamp });
            }
          });
        }
      });
      
      const processedEntries: DisplayableWordSoundEntry[] = Array.from(wordSentenceMap.entries()).map(([word, data]) => ({
        word,
        sentence: data.sentence,
      })).sort((a, b) => a.word.localeCompare(b.word)); // Sort alphabetically by word

      setDisplayableEntries(processedEntries);
    }
  }, []);

  const handlePlayWordAudio = (word: string) => {
    console.log(`Playing audio for word: ${word}`);
    alert(`Audio playback for "${word}" is not yet implemented. This feature will use Text-to-Speech in the future.`);
  };

  const handlePlaySentenceAudio = (sentence: string | null) => {
    if (!sentence) return;
    console.log(`Playing audio for sentence: ${sentence}`);
    alert(`Audio playback for the sentence "${sentence}" is not yet implemented. This feature will use Text-to-Speech in the future.`);
  };

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
              Loading your learned words and sentences...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-pulse space-y-3">
              <div className="h-8 bg-muted rounded w-3/4 mx-auto"></div>
              <div className="h-8 bg-muted rounded w-1/2 mx-auto"></div>
              <div className="h-8 bg-muted rounded w-2/3 mx-auto"></div>
            </div>
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
            Your Learned Words & Sentences
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Practice listening to words and their example sentences. Click the speaker icon to hear them (feature coming soon).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {displayableEntries.length > 0 ? (
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
          ) : (
            <div className="text-center py-10">
              <BookOpenText className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground mb-4">No words learned yet.</p>
              <p className="text-md text-muted-foreground mb-6">
                Go to the &quot;Words&quot; section to generate some vocabulary and start your learning journey!
              </p>
              <Button asChild>
                <Link href="/words">Generate Words</Link>
              </Button>
            </div>
          )}
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
