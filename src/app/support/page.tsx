
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LifeBuoy, Send, Home, Mail, ListFilter, Type, CheckCircle, AlertTriangle, Loader2, Unlock } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { SUPPORT_CATEGORIES } from '@/constants/data';
import { handleSupportRequest, type HandleSupportRequestResult, type SupportRequestInput } from '@/app/actions';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useLocalization } from '@/hooks/useLocalization';

const supportFormSchema = z.object({
  email: z.string().email("Invalid email address.").min(1, "Email is required."),
  subject: z.string().min(3, "Subject must be at least 3 characters.").max(100, "Subject is too long."),
  category: z.string().min(1, "Please select a category."),
  description: z.string().min(10, "Description must be at least 10 characters.").max(2000, "Description is too long."),
});

type SupportFormValues = z.infer<typeof supportFormSchema>;

export default function SupportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formSubmittedSuccessfully, setFormSubmittedSuccessfully] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLocalization();

  const form = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      email: "",
      subject: "",
      category: "",
      description: "",
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && user.email) {
        form.setValue("email", user.email);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, [form]);

  async function onSubmit(data: SupportFormValues) {
    setIsLoading(true);
    setFormSubmittedSuccessfully(false);

    const submissionData: SupportRequestInput = {
      ...data,
      userId: currentUser?.uid,
    };
    
    const result: HandleSupportRequestResult = await handleSupportRequest(submissionData);
    setIsLoading(false);

    if (result.success && result.message) {
      toast({
        title: t('supportToastSuccessTitle'),
        description: t('supportToastSuccessDescription'),
      });
      setFormSubmittedSuccessfully(true);
      form.reset();
       if (currentUser && currentUser.email) { // Re-set email if user is logged in
        form.setValue("email", currentUser.email);
      }
    } else if (result.error) {
      let description = result.error;
      if (result.errors) {
        description = result.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
      }
      toast({
        variant: "destructive",
        title: t('supportToastErrorTitle'),
        description: description,
      });
    }
  }
  
  if (isAuthLoading) {
     return (
      <div className="container mx-auto py-8 px-4 flex justify-center">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="items-center text-center">
            <LifeBuoy className="w-12 h-12 text-primary mb-3" />
            <CardTitle className="text-3xl font-bold text-primary">{t('navSupport')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">{t('loading')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl rounded-xl overflow-hidden">
        <CardHeader className="items-center text-center bg-gradient-to-br from-primary to-primary/80 p-8">
          <LifeBuoy className="w-20 h-20 text-primary-foreground mb-4 drop-shadow-lg" />
          <CardTitle className="text-4xl font-bold text-primary-foreground drop-shadow-md">
            {t('supportTitle')}
          </CardTitle>
          <CardDescription className="text-lg mt-2 text-primary-foreground/90 max-w-md mx-auto">
            {t('supportDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 space-y-8 bg-background">
          <Alert variant="default" className="bg-amber-50 border-amber-400 text-amber-700">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <AlertTitle className="font-semibold">{t('supportNoteTitle')}</AlertTitle>
            <AlertDescription>
              {t('supportNoteDescription')}
            </AlertDescription>
          </Alert>

          {formSubmittedSuccessfully ? (
            <Alert variant="default" className="bg-green-50 border-green-300 text-green-700">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertTitle className="font-semibold">{t('supportSuccessTitle')}</AlertTitle>
              <AlertDescription>
                {t('supportSuccessDescription')}
                <Button variant="link" onClick={() => setFormSubmittedSuccessfully(false)} className="text-green-700 pl-1">
                    {t('supportSubmitAnother')}
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" />{t('supportEmailLabel')}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} disabled={isLoading || (!!currentUser && !!currentUser.email)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Type className="w-4 h-4 text-muted-foreground" />{t('supportSubjectLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('supportSubjectPlaceholder')} {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><ListFilter className="w-4 h-4 text-muted-foreground" />{t('supportCategoryLabel')}</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('supportCategoryPlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SUPPORT_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Type className="w-4 h-4 text-muted-foreground" />{t('supportDescriptionLabel')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('supportDescriptionPlaceholder')}
                          className="min-h-[150px] text-base"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-xl py-7 rounded-lg shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                     <>
                        <Loader2 className="mr-2.5 h-6 w-6 animate-spin" /> {t('supportSendingButton')}
                     </>
                  ) : (
                     <>
                        <Send className="mr-2.5 h-6 w-6" /> {t('supportSubmitButton')}
                     </>
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center p-6 bg-muted/30 border-t">
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
            {t('supportFooterText')}
          </p>
          <Button asChild variant="outline" size="lg">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-5 h-5" /> {t('settingsReturnToHomeButton')}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    