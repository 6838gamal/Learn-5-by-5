
"use client";

import React, { useState, useEffect } from "react";
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
import { LANGUAGES, FIELDS } from "@/constants/data";
import { handleGenerateWordSet, type GenerateWordSetActionResult } from "@/app/actions";
import { addWordSet } from "@/lib/activityStore";
import { useToast } from "@/hooks/use-toast";
import { Wand2, AlertTriangle, Languages, Lightbulb, Volume2, FileText, SpellCheck, BookOpenText } from "lucide-react";
import WordCard from "./WordCard";

const learnFormSchema = z.object({
  language: z.string().min(1, "Please select a language."),
  field: z.string().min(1, "Please select a field of knowledge."),
});

type LearnFormValues = z.infer<typeof learnFormSchema>;

export default function LearnClientPage() {
  const [generatedWords, setGeneratedWords] = useState<string[]>([]);
  const [generatedSentence, setGeneratedSentence] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<LearnFormValues>({
    resolver: zodResolver(learnFormSchema),
    defaultValues: {
      language: "",
      field: "",
    },
  });

  async function onSubmit(data: LearnFormValues) {
    setIsLoading(true);
    setError(null);
    setGeneratedWords([]);
    setGeneratedSentence("");

    const result: GenerateWordSetActionResult = await handleGenerateWordSet(data);

    if (result.words && result.sentence) {
      setGeneratedWords(result.words);
      setGeneratedSentence(result.sentence);
      addWordSet(data.language, data.field, result.words, result.sentence); // Store sentence
      toast({
        title: "Words & Sentence Generated!",
        description: `A new set for ${data.field} in ${data.language} is ready.`,
      });
    } else if (result.error) {
      setError(result.error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: result.error,
      });
       if(result.words && result.words.length > 0) { // Still show words if sentence failed
        setGeneratedWords(result.words);
      }
    }
    setIsLoading(false);
  }
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePlaySentenceAudio = () => {
    // Placeholder for future TTS functionality
    console.log(`Playing audio for sentence: ${generatedSentence}`);
    alert(`Audio playback for the sentence is not yet implemented.`);
  };

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
            Select a language and field to generate 5 topic-related words and an example sentence using them.
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
                    <Select onValueChange={field.onChange} value={field.value || ""} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          {field.value ? (
                            (() => {
                              const selectedLanguage = LANGUAGES.find(lang => lang.value === field.value);
                              return (
                                <div className="flex items-center gap-2">
                                  {selectedLanguage?.emoji && <span className="text-xl">{selectedLanguage.emoji}</span>}
                                  <span>{selectedLanguage ? selectedLanguage.label : "Choose a language..."}</span>
                                </div>
                              );
                            })()
                          ) : (
                            <SelectValue placeholder="Choose a language..." />
                          )}
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a field..." />
                        </Trigger>
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
                disabled={isLoading} 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6 rounded-lg shadow-md transition-transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent-foreground mr-2"></div>
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
          
          {isClient && ( // Ensure client-side rendering for localStorage dependent parts
            <div className="mt-8">
            {isLoading && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="shadow-sm">
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-5/6" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-6">
                  <Skeleton className="h-8 w-1/3 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            )}

            {!isLoading && generatedWords.length > 0 && (
              <>
                <h3 className="text-2xl font-semibold mb-4 text-center text-primary flex items-center justify-center gap-2">
                  <SpellCheck className="w-7 h-7 text-accent"/> Your Word Set:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generatedWords.map((word, index) => (
                    <WordCard key={index} word={word} />
                  ))}
                </div>
                
                {generatedSentence && (
                  <div className="mt-8">
                    <h3 className="text-2xl font-semibold mb-3 text-center text-primary flex items-center justify-center gap-2">
                      <FileText className="w-7 h-7 text-accent" /> Example Sentence:
                    </h3>
                    <Card className="shadow-md bg-secondary/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-lg text-foreground flex-grow">{generatedSentence}</p>
                          <Button variant="ghost" size="icon" onClick={handlePlaySentenceAudio} aria-label="Play audio for sentence">
                            <Volume2 className="w-6 h-6 text-muted-foreground hover:text-primary" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <p className="mt-6 text-sm text-muted-foreground text-center">
                  Content generated by AI. Explore meanings and usage!
                </p>
              </>
            )}
            {!isLoading && generatedWords.length === 0 && !error && ( // Initial state before any generation
                 <div className="text-center text-muted-foreground mt-8 py-6 border-2 border-dashed rounded-lg">
                    <p className="text-lg">Ready to learn some new words and sentences?</p>
                    <p>Select a language and field, then click "Generate Content".</p>
                 </div>
            )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
