
"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { LANGUAGES, FIELDS, type SelectionOption } from "@/constants/data";
import { handleGenerateWordSet, type GenerateWordSetActionResult } from "@/app/actions";
import { addWordSet } from "@/lib/activityStore";
import { useToast } from "@/hooks/use-toast";
import { Wand2, AlertTriangle, Languages, Lightbulb } from "lucide-react";
import WordCard from "./WordCard";

const learnFormSchema = z.object({
  language: z.string().min(1, "Please select a language."),
  field: z.string().min(1, "Please select a field of knowledge."),
});

type LearnFormValues = z.infer<typeof learnFormSchema>;

export default function LearnClientPage() {
  const [generatedWords, setGeneratedWords] = useState<string[]>([]);
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

    const result: GenerateWordSetActionResult = await handleGenerateWordSet(data);

    if (result.words) {
      setGeneratedWords(result.words);
      addWordSet(data.language, data.field, result.words);
      toast({
        title: "Words Generated!",
        description: `A new set of words for ${data.field} in ${data.language} is ready.`,
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
  
  // Placeholder for client-side only rendering
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);


  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">
            Discover New Words
          </CardTitle>
          <CardDescription className="text-center text-lg">
            Select a language and a field of knowledge to generate a set of 5 related words.
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a language..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
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
                    <Wand2 className="w-5 h-5" /> Generate Words
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
          
          {isClient && (
            <div className="mt-8">
            {isLoading && (
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
            )}

            {!isLoading && generatedWords.length > 0 && (
              <>
                <h3 className="text-2xl font-semibold mb-4 text-center text-primary">Your Word Set:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generatedWords.map((word, index) => (
                    <WordCard key={index} word={word} />
                  ))}
                </div>
                <p className="mt-4 text-sm text-muted-foreground text-center">
                  These words are generated by AI. Explore their meanings and usage!
                </p>
              </>
            )}
            {!isLoading && generatedWords.length === 0 && !error && (
                 <div className="text-center text-muted-foreground mt-8 py-6 border-2 border-dashed rounded-lg">
                    <p className="text-lg">Ready to learn some new words?</p>
                    <p>Select a language and field, then click "Generate Words".</p>
                 </div>
            )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
