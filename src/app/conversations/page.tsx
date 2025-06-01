
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MessageCircle, Languages, ListChecks, AlertTriangle, Wand2, Loader2 } from "lucide-react";
import { getActivityData, type WordSetRecord } from "@/lib/activityStore";
import { LANGUAGES, type SelectionOption } from "@/constants/data";
import { handleGenerateConversation, type GenerateConversationActionResult } from "@/app/actions";
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function ConversationsPage() {
  const [isClient, setIsClient] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [languageWords, setLanguageWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [generatedConversation, setGeneratedConversation] = useState<string | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && selectedLanguage) {
      const activityData = getActivityData();
      const wordsSet = new Set<string>();
      activityData.learnedItems.forEach(record => {
        if (record.language === selectedLanguage) {
          record.words.forEach(word => wordsSet.add(word));
        }
      });
      setLanguageWords(Array.from(wordsSet).sort());
      setSelectedWords([]); // Reset selected words when language changes
      setGeneratedConversation(null); // Clear previous conversation
      setError(null);
    } else {
      setLanguageWords([]);
      setSelectedWords([]);
    }
  }, [isClient, selectedLanguage]);

  const handleWordSelection = (word: string) => {
    setSelectedWords(prev =>
      prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]
    );
  };

  const onGenerateConversation = async () => {
    if (!selectedLanguage || selectedWords.length < 2) {
      setError("Please select a language and at least two words.");
      return;
    }
    setIsLoadingConversation(true);
    setError(null);
    setGeneratedConversation(null);

    const result: GenerateConversationActionResult = await handleGenerateConversation({
      language: selectedLanguage,
      selectedWords: selectedWords,
    });

    if (result.conversation) {
      setGeneratedConversation(result.conversation);
      toast({
        title: "Conversation Generated!",
        description: "Your new conversation is ready.",
      });
    } else if (result.error) {
      setError(result.error);
      toast({
        variant: "destructive",
        title: "Conversation Generation Failed",
        description: result.error,
      });
    }
    setIsLoadingConversation(false);
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
        <Card className="w-full max-w-2xl mx-auto shadow-xl">
          <CardHeader className="items-center text-center">
            <MessageCircle className="w-16 h-16 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold text-primary">Conversations Practice</CardTitle>
            <CardDescription className="text-lg mt-1">Loading interface...</CardDescription>
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
          <MessageCircle className="w-16 h-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold text-primary">
            Create a Conversation
          </CardTitle>
          <CardDescription className="text-lg mt-1">
            Select a language and some words you've learned to generate a practice conversation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="language-select" className="text-base flex items-center gap-2 mb-2">
              <Languages className="w-5 h-5 text-primary" /> Select Language:
            </Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger id="language-select">
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

          {selectedLanguage && (
            <div>
              <Label className="text-base flex items-center gap-2 mb-2">
                <ListChecks className="w-5 h-5 text-primary" /> Select Words (min. 2):
              </Label>
              {languageWords.length > 0 ? (
                <ScrollArea className="h-48 w-full rounded-md border p-4">
                  <div className="space-y-2">
                    {languageWords.map(word => (
                      <div key={word} className="flex items-center space-x-2">
                        <Checkbox
                          id={`word-${word}`}
                          checked={selectedWords.includes(word)}
                          onCheckedChange={() => handleWordSelection(word)}
                        />
                        <Label htmlFor={`word-${word}`} className="font-normal text-sm">
                          {word}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <Alert variant="default" className="bg-secondary/30">
                   <AlertTriangle className="h-4 w-4 text-primary" />
                  <AlertTitle>No Words Yet</AlertTitle>
                  <AlertDescription>
                    You haven't generated any words in {selectedLanguage} yet. 
                    Go to the <Link href="/words" className="underline hover:text-primary font-medium">Words section</Link> to add some!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <Button
            onClick={onGenerateConversation}
            disabled={isLoadingConversation || !selectedLanguage || selectedWords.length < 2}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3"
          >
            {isLoadingConversation ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" /> Generate Conversation
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {generatedConversation && (
            <div className="mt-6 space-y-3">
              <h3 className="text-xl font-semibold text-primary">Generated Conversation:</h3>
              <Card className="bg-muted/30">
                <CardContent className="p-4 whitespace-pre-line text-sm">
                  {generatedConversation}
                </CardContent>
              </Card>
            </div>
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
