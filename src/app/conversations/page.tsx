
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MessageCircle, Languages, ListChecks, AlertTriangle, Wand2, Loader2, Unlock, Settings as SettingsIcon, Home, Volume2, History } from "lucide-react";
import { 
  getActivityData as getActivityDataLocal, 
  addConversationActivity as addConversationActivityLocal,
  type WordSetActivityRecord,
  type ConversationActivityRecord
} from "@/lib/activityStore";
import { TARGET_LANGUAGES, TARGET_FIELDS } from "@/constants/data";
import { 
  handleGenerateConversation, 
  handleGenerateAudio,
  type GenerateConversationActionResult,
  logConversationActivityAction,
  fetchUserActivitiesAction 
} from "@/app/actions";
import { getTargetLanguageSettingAction, getTargetFieldSettingAction } from '@/app/settingsActions';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useLocalization } from '@/hooks/useLocalization';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from 'date-fns';
import { ar as arLocale, enUS as enLocale } from 'date-fns/locale';

export default function ConversationsPage() {
  const [isClient, setIsClient] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [settingsTargetLanguage, setSettingsTargetLanguage] = useState<string | undefined>();
  const [settingsTargetField, setSettingsTargetField] = useState<string | undefined>();
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [languageWords, setLanguageWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [generatedConversation, setGeneratedConversation] = useState<string | null>(null);
  const [previousConversations, setPreviousConversations] = useState<ConversationActivityRecord[]>([]);
  
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t, language: currentLang } = useLocalization();
  const dateLocale = currentLang === 'ar' ? arLocale : enLocale;

  // Load user settings (target language)
  useEffect(() => {
    setIsClient(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsSettingsLoading(true);
      if (user) {
        try {
          const [targetLang, targetField] = await Promise.all([
            getTargetLanguageSettingAction(user.uid),
            getTargetFieldSettingAction(user.uid)
          ]);
          setSettingsTargetLanguage(targetLang);
          setSettingsTargetField(targetField);
        } catch (e) {
          console.error("Failed to load user settings for Conversations page:", e);
          toast({ variant: "destructive", title: t('error'), description: "Could not load settings" });
        }
      } else {
        setSettingsTargetLanguage(undefined);
        setSettingsTargetField(undefined);
      }
      setIsSettingsLoading(false);
    });
    return () => unsubscribe();
  }, [toast, t]);

  const loadPageData = useCallback(async (language: string, field: string, user: User | null) => {
    if (!isClient || !language || !field) {
      setLanguageWords([]);
      setSelectedWords([]);
      setPreviousConversations([]);
      setIsDataLoading(false);
      return;
    }
    
    setIsDataLoading(true);
    let wordsSet = new Set<string>();
    let conversations: ConversationActivityRecord[] = [];

    if (user) { 
      const result = await fetchUserActivitiesAction({ userId: user.uid });
      if (result.activities) {
        result.activities.forEach(record => {
          if (record.language === language) {
            if (record.type === 'wordSet' && (record as WordSetActivityRecord).field === field) {
              (record as WordSetActivityRecord).wordEntries.forEach(entry => wordsSet.add(entry.word));
            } else if (record.type === 'conversation' && (record as ConversationActivityRecord).field === field) {
              conversations.push(record as ConversationActivityRecord);
            }
          }
        });
      } else if (result.error) {
        setError("Could not load your learned words and conversations. Using local data if available.");
      }
    } else if (auth.app.options.apiKey === "YOUR_API_KEY_HERE") {
        // No data for non-logged in users when Firebase is configured
        const activityData = getActivityDataLocal();
        activityData.learnedItems.forEach(record => {
          if (record.language === language) {
            if (record.type === 'wordSet' && (record as WordSetActivityRecord).field === field) {
              (record as WordSetActivityRecord).wordEntries.forEach(entry => wordsSet.add(entry.word));
            } else if (record.type === 'conversation' && (record as ConversationActivityRecord).field === field) {
              conversations.push(record as ConversationActivityRecord);
            }
          }
        });
    }

    setLanguageWords(Array.from(wordsSet).sort());
    setPreviousConversations(conversations.sort((a,b) => b.timestamp - a.timestamp));
    setSelectedWords([]); 
    setGeneratedConversation(null); 
    setError(null);
    setIsDataLoading(false);
  }, [isClient]);

  useEffect(() => {
    if (isClient && !isSettingsLoading && settingsTargetLanguage && settingsTargetField) {
        loadPageData(settingsTargetLanguage, settingsTargetField, currentUser);
    } else if (isClient && !isSettingsLoading) {
        setLanguageWords([]);
        setPreviousConversations([]);
        setIsDataLoading(false);
    }
  }, [isClient, isSettingsLoading, settingsTargetLanguage, settingsTargetField, currentUser, loadPageData]);


  const handleWordSelection = (word: string) => {
    setSelectedWords(prev =>
      prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]
    );
  };

  const onGenerateConversation = async () => {
    if (!settingsTargetLanguage || !settingsTargetField || selectedWords.length < 2) {
      setError(t('conversationsErrorSelectWords'));
      return;
    }
    setIsLoadingConversation(true);
    setError(null);
    setGeneratedConversation(null);

    const result: GenerateConversationActionResult = await handleGenerateConversation({
      language: settingsTargetLanguage,
      field: settingsTargetField,
      selectedWords: selectedWords,
      userId: currentUser?.uid,
    });

    setIsLoadingConversation(false);

    if (result.conversation && result.language && result.selectedWords && result.field) {
      const newConversation = result.conversation;
      setGeneratedConversation(newConversation);
      toast({ title: t('toastSettingsSavedTitle'), description: "Your new conversation is ready." });

      const newRecord: ConversationActivityRecord = {
        id: Date.now().toString(),
        type: 'conversation',
        language: result.language,
        field: result.field,
        selectedWords: result.selectedWords,
        conversation: newConversation,
        timestamp: Date.now()
      };
      
      setPreviousConversations(prev => [newRecord, ...prev]);

      if (currentUser) {
        const logResult = await logConversationActivityAction({
          userId: currentUser.uid,
          language: result.language,
          field: result.field,
          selectedWords: result.selectedWords,
          conversation: newConversation,
        });
        if (!logResult.success) {
          toast({ variant: "destructive", title: "Logging Failed", description: "Could not save conversation to your account."});
        }
      } else if (auth.app.options.apiKey === "YOUR_API_KEY_HERE"){
         addConversationActivityLocal(result.language, result.field, result.selectedWords, newConversation);
         toast({ title: "Activity Saved Locally", description: "Log in to save progress to your account."});
      }
    } else if (result.error) {
      setError(result.error);
      toast({ variant: "destructive", title: "Conversation Generation Failed", description: result.error });
    }
  };

  const handlePlayConversationAudio = async (text: string | null, id: string) => {
    if (!text) return;
    setAudioLoadingId(id);
    try {
      const result = await handleGenerateAudio(text);
      if (result.audioDataUri) {
        const audio = new Audio(result.audioDataUri);
        audio.play();
        audio.onended = () => setAudioLoadingId(null);
        audio.onerror = () => setAudioLoadingId(null);
      } else {
        toast({ variant: "destructive", title: "Audio Generation Failed", description: result.error || "Could not generate audio." });
        setAudioLoadingId(null);
      }
    } catch (e) {
      console.error("Failed to play audio:", e);
      toast({ variant: "destructive", title: "Playback Error", description: "An unexpected error occurred." });
      setAudioLoadingId(null);
    }
  };
  
  const targetLanguageLabel = useMemo(() => {
      const lang = TARGET_LANGUAGES.find(l => l.value === settingsTargetLanguage);
      return lang ? lang.label : (settingsTargetLanguage || "");
  }, [settingsTargetLanguage]);

  const targetFieldLabel = useMemo(() => {
    const field = TARGET_FIELDS.find(f => f.value === settingsTargetField);
    return field ? field.label : (settingsTargetField || "");
  }, [settingsTargetField]);

  if (!isClient || isSettingsLoading) { 
    return (
       <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-2xl mx-auto shadow-xl">
          <CardHeader className="items-center text-center">
            <MessageCircle className="w-16 h-16 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold text-primary">{t('conversationsTitle')}</CardTitle>
            <CardDescription className="text-lg mt-1">Loading interface...</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!currentUser && auth.app.options.apiKey !== "YOUR_API_KEY_HERE" && isClient && !isSettingsLoading) {
     return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-md mx-auto shadow-xl">
          <CardHeader className="items-center text-center">
            <Unlock className="w-12 h-12 text-primary mb-3" />
            <CardTitle className="text-2xl font-bold text-primary">{t('loginRequiredTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{t('loginRequiredDescription')}</p>
            <Button asChild>
              <Link href="/auth/login">{t('goToLoginButton')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isSettingsLoading && (!settingsTargetLanguage || !settingsTargetField)) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-lg mx-auto shadow-xl">
          <CardHeader className="items-center text-center">
            <SettingsIcon className="w-10 h-10 text-primary mb-3" />
            <CardTitle className="text-2xl font-bold text-primary">{t('wordsSetPreferencesPromptTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
                {t('wordsSetPreferencesPromptDescription')}
            </p>
            <Button asChild>
              <Link href="/settings">{t('wordsGoToSettingsButton')}</Link>
            </Button>
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
            {t('conversationsTitle')}
          </CardTitle>
          <CardDescription className="text-lg mt-1">
            {t('conversationsDescription')}
            <br />
            Practicing in: <strong className="text-primary">{targetLanguageLabel} - {targetFieldLabel}</strong>.
             {currentUser && (
                <Link href="/settings" className="text-sm underline text-primary hover:text-accent ml-1">({t('wordsChangePreferencesLink')})</Link>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {settingsTargetLanguage && (
            <div>
              <Label className="text-base flex items-center gap-2 mb-2">
                <ListChecks className="w-5 h-5 text-primary" /> {t('conversationsSelectWordsLabel')}
              </Label>
              {isDataLoading ? (
                <div className="h-48 w-full rounded-md border p-4 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : languageWords.length > 0 ? (
                <ScrollArea className="h-48 w-full rounded-md border p-4">
                  <div className="space-y-2">
                    {languageWords.map(word => (
                      <div key={word} className="flex items-center space-x-2">
                        <Checkbox
                          id={`word-${word}`}
                          checked={selectedWords.includes(word)}
                          onCheckedChange={() => handleWordSelection(word)}
                          disabled={isLoadingConversation}
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
                    {t('conversationsAlertNoWords', { langLabel: targetLanguageLabel, fieldLabel: targetFieldLabel })}
                    <Link href="/words" className="underline hover:text-primary font-medium ml-1">{t('conversationsAlertGoToWords')}</Link>!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <Button
            onClick={onGenerateConversation}
            disabled={isLoadingConversation || !settingsTargetLanguage || !settingsTargetField || selectedWords.length < 2 || isDataLoading || isSettingsLoading}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3"
          >
            {isLoadingConversation ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('conversationsGeneratingButton')}
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" /> {t('conversationsGenerateButton')}
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('error')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="mt-2 border-t pt-6">
             <h3 className="text-xl font-semibold mb-3 text-primary flex items-center gap-2">
                <History className="w-6 h-6 text-accent" />
                {t('conversationsPreviousTitle')}
            </h3>
             {isDataLoading ? (
                <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
             ) : previousConversations.length > 0 ? (
                <Accordion type="multiple" className="w-full">
                    {previousConversations.map((conv) => (
                    <AccordionItem value={conv.id} key={conv.id}>
                        <AccordionTrigger className="text-base hover:bg-muted/50 px-3 py-3 rounded-md text-left">
                           {t('conversationsAccordionTriggerLabel', { 
                                date: formatDistanceToNow(new Date(conv.timestamp), { addSuffix: true, locale: dateLocale }),
                                words: conv.selectedWords.slice(0, 3).join(', ') 
                            })}
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pt-2 pb-3 space-y-3">
                            <Card className="bg-muted/30">
                                <CardContent className="p-4 whitespace-pre-line text-sm">
                                {conv.conversation}
                                </CardContent>
                            </Card>
                            <Button variant="outline" size="sm" onClick={() => handlePlayConversationAudio(conv.conversation, conv.id)} disabled={!!audioLoadingId}>
                                {audioLoadingId === conv.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                                <span className="ml-2">Play Audio</span>
                            </Button>
                        </AccordionContent>
                    </AccordionItem>
                    ))}
                </Accordion>
             ) : (
                <Alert variant="default" className="bg-secondary/30">
                   <AlertTriangle className="h-4 w-4 text-primary" />
                   <AlertTitle>{t('conversationsAlertNoHistoryTitle')}</AlertTitle>
                   <AlertDescription>{t('conversationsAlertNoHistory')}</AlertDescription>
                </Alert>
             )}
          </div>


          {generatedConversation && (
            <div className="mt-6 space-y-3 border-t pt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-primary">{t('conversationsGeneratedTitle')}</h3>
                <Button variant="outline" size="sm" onClick={() => handlePlayConversationAudio(generatedConversation, 'current')} disabled={!!audioLoadingId}>
                  {audioLoadingId === 'current' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                  <span className="ml-2">Play Audio</span>
                </Button>
              </div>
              <Card className="bg-muted/30">
                <CardContent className="p-4 whitespace-pre-line text-sm">
                  {generatedConversation}
                </CardContent>
              </Card>
            </div>
          )}
          
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

    
