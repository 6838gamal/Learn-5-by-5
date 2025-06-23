
"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Award, ChevronRight, Home } from "lucide-react";
import { useLocalization } from '@/hooks/useLocalization';

const examList = [
  { name: "Vocabulary Test", slug: "vocabulary-test" },
  { name: "Grammar Quiz", slug: "grammar-quiz" },
  { name: "Reading Comprehension Exam", slug: "reading-comprehension-exam" },
  { name: "Listening Comprehension Test", slug: "listening-comprehension-test" },
  { name: "Writing Prompt Assessment", slug: "writing-prompt-assessment" },
  { name: "Speaking Assessment", slug: "speaking-assessment" },
  { name: "Sentence Structure Test", slug: "sentence-structure-test" },
  { name: "Phrasal Verbs Exam", slug: "phrasal-verbs-exam" },
  { name: "Idioms and Expressions Quiz", slug: "idioms-and-expressions-quiz" },
  { name: "Synonyms and Antonyms Test", slug: "synonyms-and-antonyms-test" },
  { name: "Tense Usage Exam", slug: "tense-usage-exam" },
  { name: "Spelling Test", slug: "spelling-test" },
  { name: "Cloze Passage Exam", slug: "cloze-passage-exam" },
  { name: "Pronunciation Assessment", slug: "pronunciation-assessment" },
  { name: "Dialogue Completion Test", slug: "dialogue-completion-test" },
  { name: "Contextual Vocabulary Quiz", slug: "contextual-vocabulary-quiz" },
  { name: "Language Function Test", slug: "language-function-test" },
  { name: "Cultural Knowledge Quiz", slug: "cultural-knowledge-quiz" },
  { name: "Error Correction Exercise", slug: "error-correction-exercise" },
  { name: "Multiple Choice Vocabulary Test", slug: "multiple-choice-vocabulary-test" },
  { name: "Short Answer Questions", slug: "short-answer-questions" },
  { name: "Essay Writing Exam", slug: "essay-writing-exam" },
  { name: "Translation Test", slug: "translation-test" },
  { name: "Word Formation Test", slug: "word-formation-test" },
  { name: "Role-Play Assessment", slug: "role-play-assessment" },
  { name: "Homophones and Homographs Quiz", slug: "homophones-and-homographs-quiz" },
  { name: "Listening for Specific Information Test", slug: "listening-for-specific-information-test" },
  { name: "Grammar Correction Exercise", slug: "grammar-correction-exercise" },
  { name: "Story Retelling Assessment", slug: "story-retelling-assessment" },
  { name: "Timed Vocabulary Challenge", slug: "timed-vocabulary-challenge" },
];

export default function ExamsPage() {
  const { t } = useLocalization();

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader className="items-center text-center">
          <Award className="w-16 h-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold text-primary">
            {t('examsListTitle')}
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            {t('examsListDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-3">
            <ul className="space-y-3">
              {examList.map((exam) => (
                <li key={exam.slug}>
                  <Button asChild variant="outline" className="w-full justify-between hover:bg-secondary/50 transition-colors py-6">
                    <Link href={`/exams/${exam.slug}`}>
                      <span className="text-base font-medium text-foreground">{exam.name}</span>
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
                <Home className="w-4 h-4" /> {t('settingsReturnToHomeButton')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    