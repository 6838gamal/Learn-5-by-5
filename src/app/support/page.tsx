
"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
import { LifeBuoy, Send, Home, Mail, ListFilter, Type, CheckCircle, AlertTriangle, Loader2, Unlock, History, Ticket } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { SUPPORT_CATEGORIES } from '@/constants/data';
import { handleSupportRequest, fetchUserSupportTicketsAction, type HandleSupportRequestResult, type SupportRequestInput } from '@/app/actions';
import type { SupportTicket } from '@/lib/supportService';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useLocalization } from '@/hooks/useLocalization';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from 'date-fns';
import { ar as arLocale, enUS as enLocale } from 'date-fns/locale';

const supportFormSchema = z.object({
  email: z.string().email("Invalid email address.").min(1, "Email is required."),
  subject: z.string().min(3, "Subject must be at least 3 characters.").max(100, "Subject is too long."),
  category: z.string().min(1, "Please select a category."),
  description: z.string().min(10, "Description must be at least 10 characters.").max(2000, "Description is too long."),
});

type SupportFormValues = z.infer<typeof supportFormSchema>;

export default function SupportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { t, language } = useLocalization();
  const dateLocale = language === 'ar' ? arLocale : enLocale;

  const form = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      email: "",
      subject: "",
      category: "",
      description: "",
    },
  });
  
  const fetchTickets = useCallback(async (user: User) => {
    setIsLoadingTickets(true);
    setFetchError(null);
    const result = await fetchUserSupportTicketsAction({ userId: user.uid });
    if (result.tickets) {
      setTickets(result.tickets);
    } else if (result.error) {
      setFetchError(result.error);
      toast({ variant: "destructive", title: t('error'), description: result.error });
    }
    setIsLoadingTickets(false);
  }, [toast, t]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
      if (user) {
        if (user.email) form.setValue("email", user.email);
        fetchTickets(user);
      } else {
        setIsLoadingTickets(false);
      }
    });
    return () => unsubscribe();
  }, [form, fetchTickets]);

  async function onSubmit(data: SupportFormValues) {
    setIsSubmitting(true);

    const submissionData: SupportRequestInput = {
      ...data,
      userId: currentUser?.uid,
    };
    
    const result: HandleSupportRequestResult = await handleSupportRequest(submissionData);
    setIsSubmitting(false);

    if (result.success) {
      toast({ title: t('supportToastSuccessTitle'), description: t('supportToastSuccessDescription') });
      form.reset();
      if (currentUser) {
        if (currentUser.email) form.setValue("email", currentUser.email);
        fetchTickets(currentUser);
      }
    } else if (result.error) {
      let description = result.error;
      if (result.errors) {
        description = result.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
      }
      toast({ variant: "destructive", title: t('supportToastErrorTitle'), description: description });
    }
  }
  
  const getStatusVariant = (status: SupportTicket['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Open': return 'default';
      case 'In Progress': return 'secondary';
      case 'Resolved': return 'outline';
      case 'Closed': return 'destructive';
      default: return 'default';
    }
  };
  
  const getStatusLabel = (status: SupportTicket['status']) => {
    const keyMap = {
        'Open': 'supportStatusOpen',
        'In Progress': 'supportStatusInProgress',
        'Resolved': 'supportStatusResolved',
        'Closed': 'supportStatusClosed'
    } as const;
    return t(keyMap[status]);
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" />{t('supportEmailLabel')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} disabled={isSubmitting || (!!currentUser && !!currentUser.email)} />
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
                      <Input placeholder={t('supportSubjectPlaceholder')} {...field} disabled={isSubmitting} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
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
                        disabled={isSubmitting}
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (
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
          
          {currentUser && (
            <>
              <Separator className="my-8" />
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground flex items-center">
                  <History className="w-6 h-6 text-accent me-2" />
                  {t('supportPreviousRequestsTitle')}
                </h3>
                {isLoadingTickets ? (
                  <div className="text-center text-muted-foreground flex items-center justify-center gap-2 py-4">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('supportLoadingTickets')}
                  </div>
                ) : fetchError ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{t('error')}</AlertTitle>
                    <AlertDescription>{fetchError}</AlertDescription>
                  </Alert>
                ) : tickets.length > 0 ? (
                  <Accordion type="multiple" className="w-full">
                    {tickets.map((ticket) => (
                      <AccordionItem value={ticket.id} key={ticket.id}>
                        <AccordionTrigger className="text-base hover:bg-muted/50 px-3 py-3 rounded-md">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full text-left">
                            <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-xs">{ticket.subject}</span>
                            <div className="flex items-center gap-2 mt-1 sm:mt-0">
                              <Badge variant={getStatusVariant(ticket.status)}>{getStatusLabel(ticket.status)}</Badge>
                              <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: dateLocale })}</span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pt-2 pb-3 space-y-3 bg-background border-t">
                          <div className="flex items-center gap-2 text-sm">
                            <strong className="text-muted-foreground w-24 shrink-0">{t('supportTicketCategory')}:</strong>
                            <span>{SUPPORT_CATEGORIES.find(c => c.value === ticket.category)?.label || ticket.category}</span>
                          </div>
                          <div className="flex flex-col gap-1 text-sm">
                            <strong className="text-muted-foreground">{t('supportTicketDescription')}:</strong>
                            <p className="p-3 bg-muted/50 rounded-md whitespace-pre-wrap text-foreground">{ticket.description}</p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <Alert variant="default" className="bg-secondary/30">
                    <Ticket className="h-4 w-4 text-primary"/>
                    <AlertTitle>{t('supportNoTickets')}</AlertTitle>
                  </Alert>
                )}
              </div>
            </>
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
