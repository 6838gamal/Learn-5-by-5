
"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardList, ChevronRight, Home } from "lucide-react";

const exerciseList = [
  { name: "Missing Letter Fill-in", slug: "missing-letter-fill-in" },
  { name: "Complete the Word", slug: "complete-the-word" },
  { name: "Word Gap Exercise", slug: "word-gap-exercise" },
  { name: "Fill in the Blanks", slug: "fill-in-the-blanks" },
  { name: "Letter Hunt", slug: "letter-hunt" },
  { name: "Word Completion Challenge", slug: "word-completion-challenge" },
  { name: "Word Puzzle Sentences", slug: "word-puzzle-sentences" },
  { name: "Sentence Completion", slug: "sentence-completion" },
  { name: "Letter Drop Exercise", slug: "letter-drop-exercise" },
  { name: "Vocabulary Fill-in", slug: "vocabulary-fill-in" },
  { name: "Word Scramble and Use", slug: "word-scramble-and-use" },
  { name: "Missing Letters Sentences", slug: "missing-letters-sentences" },
  { name: "Cloze Activity", slug: "cloze-activity" },
  { name: "Word Formation Exercise", slug: "word-formation-exercise" },
  { name: "Contextual Word Use", slug: "contextual-word-use" },
  { name: "Sentence Builder", slug: "sentence-builder" },
  { name: "Word Recall Exercise", slug: "word-recall-exercise" },
  { name: "Letter Replacement Quiz", slug: "letter-replacement-quiz" },
  { name: "Fill in the Missing Letters", slug: "fill-in-the-missing-letters" },
  { name: "Vocabulary Context Practice", slug: "vocabulary-context-practice" },
  { name: "Word Association Challenge", slug: "word-association-challenge" },
  { name: "Letter Fill Exercise", slug: "letter-fill-exercise" },
  { name: "Vocabulary Gap Fill", slug: "vocabulary-gap-fill" },
  { name: "Word Usage in Context", slug: "word-usage-in-context" },
  { name: "Sentence Gap Fill", slug: "sentence-gap-fill" },
  { name: "Letter Completion Challenge", slug: "letter-completion-challenge" },
  { name: "Contextual Vocabulary Exercise", slug: "contextual-vocabulary-exercise" },
  { name: "Fill-in-the-Word Sentences", slug: "fill-in-the-word-sentences" },
  { name: "Word Completion with Context", slug: "word-completion-with-context" },
  { name: "Interactive Word Fill Exercise", slug: "interactive-word-fill-exercise" },
];

export default function ExercisesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader className="items-center text-center">
          <ClipboardList className="w-16 h-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold text-primary">
            Available Exercises
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Select an exercise from the list below to start practicing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-3">
            <ul className="space-y-3">
              {exerciseList.map((exercise) => (
                <li key={exercise.slug}>
                  <Button asChild variant="outline" className="w-full justify-between hover:bg-secondary/50 transition-colors py-6">
                    <Link href={`/exercises/${exercise.slug}`}>
                      <span className="text-base font-medium text-foreground">{exercise.name}</span>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
           <div className="mt-8 text-center border-t pt-6">
            <Button asChild variant="outline">
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" /> Return to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
