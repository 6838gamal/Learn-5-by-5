
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Volume2, Info, BookOpenText } from "lucide-react";
import Link from "next/link";
import { getActivityData, type WordSetRecord } from "@/lib/activityStore";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Added Alert components

export default function SoundsPage() {
  const [allUniqueWords, setAllUniqueWords] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      const activityData = getActivityData();
      const wordsSet = new Set<string>();
      activityData.learnedItems.forEach(record => {
        record.words.forEach(word => wordsSet.add(word));
      });
      setAllUniqueWords(Array.from(wordsSet).sort()); // Sort words alphabetically
    }
  }, []);

  const handlePlayWordAudio = (word: string) => {
    console.log(`Playing audio for word: ${word}`);
    alert(`Audio playback for "${word}" is not yet implemented. This feature will use Text-to-Speech in the future.`);
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
              Loading your learned words...
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
            Your Learned Words
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Practice listening to the words you've generated. Click the speaker icon next to a word to hear it (feature coming soon).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allUniqueWords.length > 0 ? (
            <>
              <Alert className="mb-6 bg-secondary/30">
                <Info className="h-5 w-5 text-primary" />
                <AlertTitle className="font-semibold text-primary">Practice Tip</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                  Listen carefully to each word. Try to repeat it aloud. You can generate more words in the <Link href="/words" className="underline hover:text-primary">Words section</Link>.
                </AlertDescription>
              </Alert>
              <ScrollArea className="h-[400px] pr-3">
                <ul className="space-y-3">
                  {allUniqueWords.map((word, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between p-3 bg-card border rounded-lg shadow-sm hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-lg font-medium text-foreground">{word}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePlayWordAudio(word)}
                        aria-label={`Play audio for ${word}`}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Volume2 className="w-5 h-5" />
                      </Button>
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

    