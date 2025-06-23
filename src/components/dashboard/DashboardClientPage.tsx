
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  getStats as getStatsLocal, 
  getActivityData as getActivityDataLocal, 
  type LearningStats, 
  type ActivityRecord, 
  type WordSetActivityRecord,
  type ConversationActivityRecord,
} from "@/lib/activityStore";
import { 
  fetchUserActivitiesAction, 
  fetchUserLearningStatsAction,
  handleGenerateAudio, // Import audio action
  type FetchUserActivitiesResult,
  type FetchUserLearningStatsResult
} from "@/app/actions";
import { BarChart as BarChartIcon, BookOpenText, Layers, ListChecks, Clock, Volume2, FileText, MessageSquare, Loader2, Unlock, Languages, TrendingUp, Activity } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import StatCard from "./StatCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useRouter } from "next/navigation";
import { useLocalization } from "@/hooks/useLocalization";
import { useToast } from "@/hooks/use-toast";

const initialStats: LearningStats = { 
  totalWordsLearned: 0, 
  fieldsCoveredCount: 0, 
  wordSetsGenerated: 0, 
  languagesCoveredCount: 0 
};

export default function DashboardClientPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [stats, setStats] = useState<LearningStats | null>(initialStats);
  const [recentActivity, setRecentActivity] = useState<ActivityRecord[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true); // Unified loading state
  const [selectedActivity, setSelectedActivity] = useState<ActivityRecord | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [audioLoading, setAudioLoading] = useState<string | null>(null); // For audio loading state
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useLocalization();
  const { toast } = useToast();

  const loadDashboardData = useCallback(async (user: User | null) => {
    setError(null);
    let loadedStats: LearningStats | null = initialStats;
    let loadedActivity: ActivityRecord[] = [];

    if (user) {
      const [statsResult, activityResult] = await Promise.all([
        fetchUserLearningStatsAction({ userId: user.uid }),
        fetchUserActivitiesAction({ userId: user.uid, count: 5 })
      ]);

      if (statsResult.stats) {
        loadedStats = statsResult.stats;
      } else {
        setError(statsResult.error || "Could not load learning statistics.");
      }

      if (activityResult.activities) {
        loadedActivity = activityResult.activities;
      } else {
        setError(prevError => `${prevError || ""} ${activityResult.error || "Could not load recent activity."}`.trim());
      }
    } else if (auth.app.options.apiKey === "YOUR_API_KEY_HERE" || auth.app.options.appId === "YOUR_APP_ID_HERE") {
      loadedStats = getStatsLocal();
      loadedActivity = getActivityDataLocal().learnedItems.slice(0, 5);
    }
    
    setStats(loadedStats);
    setRecentActivity(loadedActivity);
    setIsLoadingPage(false); 
  }, []);

  useEffect(() => {
    setIsClient(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        loadDashboardData(user);
      } else {
        const isFirebaseConfigured = !(auth.app.options.apiKey === "YOUR_API_KEY_HERE" || auth.app.options.appId === "YOUR_APP_ID_HERE");
        
        if (isFirebaseConfigured) {
          router.push('/auth/login');
        } else {
          loadDashboardData(null);
        }
      }
    });
    return () => unsubscribe();
  }, [loadDashboardData, router]);


  const handleActivityClick = (activity: ActivityRecord) => {
    setSelectedActivity(activity);
    setIsDetailDialogOpen(true);
  };
  
  const handlePlayAudioInDialog = async (text: string) => {
    if (!text) return;
    if (audioLoading) return; // Prevent multiple requests at once

    setAudioLoading(text);
    try {
      const result = await handleGenerateAudio(text);
      if (result.audioDataUri) {
        const audio = new Audio(result.audioDataUri);
        audio.play();
      } else {
        toast({
          variant: "destructive",
          title: "Audio Generation Failed",
          description: result.error || "Could not generate audio for the selected text.",
        });
      }
    } catch (e) {
      console.error("Failed to play audio:", e);
      toast({
        variant: "destructive",
        title: "Playback Error",
        description: "An unexpected error occurred while trying to play the audio.",
      });
    } finally {
      setAudioLoading(null);
    }
  };

  const currentStats = stats || initialStats;
  const chartData = [
    { metric: t('dashboardChartMetricWords'), count: currentStats.totalWordsLearned, fill: "var(--color-words)" },
    { metric: t('dashboardChartMetricLanguages'), count: currentStats.languagesCoveredCount, fill: "var(--color-languages)" },
    { metric: t('dashboardChartMetricFields'), count: currentStats.fieldsCoveredCount, fill: "var(--color-fields)" },
    { metric: t('dashboardChartMetricSets'), count: currentStats.wordSetsGenerated, fill: "var(--color-sets)" },
  ];

  const chartConfig = {
    count: {
      label: t('dashboardChartLabelCount'),
    },
    words: {
      label: t('dashboardChartMetricWords'),
      color: "hsl(var(--chart-1))",
    },
    languages: {
      label: t('dashboardChartMetricLanguages'),
      color: "hsl(var(--chart-2))",
    },
    fields: {
      label: t('dashboardChartMetricFields'),
      color: "hsl(var(--chart-3))",
    },
    sets: {
      label: t('dashboardChartMetricSets'),
      color: "hsl(var(--chart-4))",
    },
  } satisfies ChartConfig;


  if (!isClient || isLoadingPage) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-primary text-center">{t('dashboardTitle')}</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
             <Card key={i} className="shadow-lg animate-pulse"><CardHeader><div className="h-6 bg-muted rounded w-1/2"></div></CardHeader><CardContent><div className="h-10 bg-muted rounded w-3/4"></div></CardContent></Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-xl animate-pulse"><CardHeader><div className="h-8 bg-muted rounded w-1/3"></div></CardHeader><CardContent><div className="h-64 bg-muted rounded flex items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin"/></div></CardContent></Card>
            <Card className="shadow-xl animate-pulse"><CardHeader><div className="h-8 bg-muted rounded w-1/3"></div></CardHeader><CardContent><div className="h-64 bg-muted rounded flex items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin"/></div></CardContent></Card>
        </div>
      </div>
    );
  }
  
  const renderActivityItem = (activity: ActivityRecord) => {
    const timestamp = activity.timestamp ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) : t('dashboardActivityJustNow');
    if (activity.type === 'wordSet') {
      const wordSet = activity as WordSetActivityRecord;
      const firstWord = wordSet.wordEntries?.[0]?.word || t('dashboardActivityWords');
      return (
        <>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">{wordSet.language} - {wordSet.field}</span>
          </div>
          <p className="text-xs text-muted-foreground ml-6">
            {t('dashboardActivityGenerated', { count: wordSet.wordEntries?.length || 0, firstWord })}
          </p>
          <span className="text-xs text-muted-foreground/80 absolute top-3 right-3">{timestamp}</span>
        </>
      );
    } else if (activity.type === 'conversation') {
      const conv = activity as ConversationActivityRecord;
      return (
         <>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">{t('dashboardActivityConversation', { language: conv.language })}</span>
          </div>
          <p className="text-xs text-muted-foreground ml-6 truncate">
            {t('dashboardActivityConversationWords', { words: conv.selectedWords.join(", ") })}
          </p>
           <span className="text-xs text-muted-foreground/80 absolute top-3 right-3">{timestamp}</span>
        </>
      );
    }
    return null;
  };

  const renderDialogContent = () => {
    if (!selectedActivity) return null;

    if (selectedActivity.type === 'wordSet') {
      const wordSet = selectedActivity as WordSetActivityRecord;
      return (
        <>
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              <Layers className="w-5 h-5 text-accent" />
              {t('dashboardDialogWordSetTitle')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t('dashboardDialogWordSetDesc', { field: wordSet.field, language: wordSet.language })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center">
              <span className="text-sm font-medium text-muted-foreground w-24">{t('dashboardDialogLanguage')}</span>
              <span className="text-sm text-foreground">{wordSet.language}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-muted-foreground w-24">{t('dashboardDialogField')}</span>
              <span className="text-sm text-foreground">{wordSet.field}</span>
            </div>
            <div className="flex items-start">
              <span className="text-sm font-medium text-muted-foreground w-24 mt-1">{t('dashboardDialogEntries')}</span>
              <ScrollArea className="h-48 w-full rounded-md border p-2">
                <ul className="space-y-3">
                  {wordSet.wordEntries?.map((entry, index) => (
                    <li key={index} className="border-b pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
                      <div className="flex items-center justify-between">
                        <strong className="text-sm text-foreground">{entry.word}</strong>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handlePlayAudioInDialog(entry.word)} disabled={!!audioLoading} aria-label={`Play audio for ${entry.word}`}>
                           {audioLoading === entry.word ? <Loader2 className="w-4 h-4 animate-spin"/> : <Volume2 className="w-4 h-4 text-muted-foreground hover:text-primary" />}
                        </Button>
                      </div>
                      <div className="flex items-start justify-between gap-1 mt-1">
                        <p className="text-xs text-muted-foreground flex-grow">{entry.sentence}</p>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handlePlayAudioInDialog(entry.sentence)} disabled={!!audioLoading} aria-label={`Play audio for sentence: ${entry.sentence}`}>
                           {audioLoading === entry.sentence ? <Loader2 className="w-4 h-4 animate-spin"/> : <Volume2 className="w-4 h-4 text-muted-foreground hover:text-primary" />}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-muted-foreground w-24">{t('dashboardDialogDate')}</span>
              <span className="text-sm text-foreground">
                {selectedActivity.timestamp ? new Date(selectedActivity.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
              </span>
            </div>
          </div>
        </>
      );
    } else if (selectedActivity.type === 'conversation') {
      const conv = selectedActivity as ConversationActivityRecord;
      return (
        <>
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accent" />
              {t('dashboardDialogConversationTitle')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t('dashboardDialogConversationDesc', { language: conv.language })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center">
              <span className="text-sm font-medium text-muted-foreground w-32">{t('dashboardDialogLanguage')}</span>
              <span className="text-sm text-foreground">{conv.language}</span>
            </div>
             <div className="flex items-start">
              <span className="text-sm font-medium text-muted-foreground w-32 mt-1">{t('dashboardDialogWordsUsed')}</span>
              <ScrollArea className="h-20 w-full rounded-md border p-2">
                <ul className="list-disc list-inside text-sm text-foreground">
                  {conv.selectedWords.map((word, index) => (
                    <li key={index}>{word}</li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
            <div className="flex items-start">
              <span className="text-sm font-medium text-muted-foreground w-32 mt-1">{t('dashboardDialogConversation')}</span>
              <div className="flex-grow">
                <Button variant="ghost" size="sm" onClick={() => handlePlayAudioInDialog(conv.conversation)} disabled={!!audioLoading} className="mb-2 w-full justify-start">
                    {audioLoading === conv.conversation ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Volume2 className="w-4 h-4 mr-2"/>}
                    Play Conversation
                </Button>
                <ScrollArea className="h-32 w-full rounded-md border p-2">
                    <p className="text-sm text-foreground whitespace-pre-line">{conv.conversation}</p>
                </ScrollArea>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-muted-foreground w-32">{t('dashboardDialogDate')}</span>
              <span className="text-sm text-foreground">
                {selectedActivity.timestamp ? new Date(selectedActivity.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
              </span>
            </div>
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary text-center">{t('dashboardTitle')}</h1>
      
      {error && <Alert variant="destructive" className="mb-4"><AlertTriangle className="h-4 w-4" /><AlertTitle>{t('error')}</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title={t('dashboardStatTotalWords')} value={currentStats.totalWordsLearned.toString()} icon={ListChecks} description={t('dashboardStatTotalWordsDesc')} />
        <StatCard title={t('dashboardStatLanguages')} value={currentStats.languagesCoveredCount.toString()} icon={Languages} description={t('dashboardStatLanguagesDesc')} />
        <StatCard title={t('dashboardStatFields')} value={currentStats.fieldsCoveredCount.toString()} icon={BookOpenText} description={t('dashboardStatFieldsDesc')} />
        <StatCard title={t('dashboardStatSessions')} value={currentStats.wordSetsGenerated.toString()} icon={Layers} description={t('dashboardStatSessionsDesc')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              {t('dashboardOverviewTitle')}
            </CardTitle>
            <CardDescription>
              {t('dashboardOverviewDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2 pr-6 pt-2">
            {chartData.length > 0 && chartData.some(d => d.count > 0) ? (
              <ChartContainer config={chartConfig} className="aspect-video h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="count" tickFormatter={(value) => value.toLocaleString()} />
                        <YAxis type="category" dataKey="metric" width={80} tick={{ fontSize: 12 }} />
                        <ChartTooltip
                            cursor={{fill: 'hsl(var(--muted))'}}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Bar dataKey="count" radius={5} fill="hsl(var(--primary))" />
                    </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                {t('dashboardChartNoData')}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              {t('dashboardRecentActivityTitle')}
            </CardTitle>
            <CardDescription>
              {t('dashboardRecentActivityDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <ScrollArea className="h-[250px]">
                <ul className="space-y-3">
                  {recentActivity.map((activity) => (
                    <li 
                      key={activity.id} 
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer relative"
                      onClick={() => handleActivityClick(activity)}
                    >
                      {renderActivityItem(activity)}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <p className="text-muted-foreground text-center py-4 h-[250px] flex items-center justify-center">
                {t('dashboardRecentActivityEmpty')} <Link href="/words" className="text-primary underline ml-1">{t('dashboardStartLearningLink')}</Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedActivity && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-md bg-card">
            {renderDialogContent()}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>{t('dashboardDialogClose')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
