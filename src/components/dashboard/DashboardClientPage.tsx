
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
  type FetchUserActivitiesResult,
  type FetchUserLearningStatsResult
} from "@/app/actions";
import { BarChart as BarChartIcon, BookOpenText, Layers, ListChecks, Clock, Volume2, FileText, MessageSquare, Loader2, Unlock, Languages, TrendingUp, Activity } from "lucide-react"; // Added TrendingUp, Activity
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
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<ActivityRecord | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async (user: User | null) => {
    setIsLoadingData(true);
    setError(null);
    if (user) {
      const [statsResult, activityResult] = await Promise.all([
        fetchUserLearningStatsAction({ userId: user.uid }),
        fetchUserActivitiesAction({ userId: user.uid, count: 5 }) // Fetch 5 for recent activity
      ]);

      if (statsResult.stats) {
        setStats(statsResult.stats);
      } else {
        setError(statsResult.error || "Could not load learning statistics.");
        setStats(getStatsLocal()); 
      }

      if (activityResult.activities) {
        setRecentActivity(activityResult.activities);
      } else {
        setError(prevError => `${prevError || ""} ${activityResult.error || "Could not load recent activity."}`.trim());
        setRecentActivity(getActivityDataLocal().learnedItems.slice(0, 5));
      }
    } else if (auth.app.options.apiKey !== "YOUR_API_KEY_HERE" && auth.app.options.appId !== "YOUR_APP_ID_HERE") {
         setStats(initialStats);
         setRecentActivity([]);
    } else { 
      setStats(getStatsLocal());
      setRecentActivity(getActivityDataLocal().learnedItems.slice(0, 5));
    }
    setIsLoadingData(false);
  }, []);

  useEffect(() => {
    setIsClient(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      loadDashboardData(user);
    });
    return () => unsubscribe();
  }, [loadDashboardData]);

  const handleActivityClick = (activity: ActivityRecord) => {
    setSelectedActivity(activity);
    setIsDetailDialogOpen(true);
  };
  
  const handlePlayAudioInDialog = (text: string, type: 'word' | 'sentence') => {
    alert(`Audio playback for ${type} "${text}" is not yet implemented.`);
  };

  const chartData = stats ? [
    { metric: "Words", count: stats.totalWordsLearned, fill: "var(--color-words)" },
    { metric: "Languages", count: stats.languagesCoveredCount, fill: "var(--color-languages)" },
    { metric: "Fields", count: stats.fieldsCoveredCount, fill: "var(--color-fields)" },
    { metric: "Sets", count: stats.wordSetsGenerated, fill: "var(--color-sets)" },
  ] : [];

  const chartConfig = {
    count: {
      label: "Count",
    },
    words: {
      label: "Words Learned",
      color: "hsl(var(--chart-1))",
    },
    languages: {
      label: "Languages",
      color: "hsl(var(--chart-2))",
    },
    fields: {
      label: "Fields",
      color: "hsl(var(--chart-3))",
    },
    sets: {
      label: "Sets Generated",
      color: "hsl(var(--chart-4))",
    },
  } satisfies ChartConfig;


  if (!isClient || isLoadingData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-primary text-center">Your Learning Dashboard</h1>
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

  if (!currentUser && auth.app.options.apiKey !== "YOUR_API_KEY_HERE" && auth.app.options.appId !== "YOUR_APP_ID_HERE") {
     return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-md mx-auto shadow-xl">
          <CardHeader className="items-center text-center">
            <Unlock className="w-12 h-12 text-primary mb-3" />
            <CardTitle className="text-2xl font-bold text-primary">Welcome to LinguaLeap!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">Please log in to see your personalized dashboard and save your progress.</p>
            <Button asChild>
              <Link href="/auth/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) { 
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground text-lg">Error loading dashboard data. {error}</p>
      </div>
    );
  }
  
  const renderActivityItem = (activity: ActivityRecord) => {
    const timestamp = activity.timestamp ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) : 'Just now';
    if (activity.type === 'wordSet') {
      const wordSet = activity as WordSetActivityRecord;
      const firstWord = wordSet.wordEntries?.[0]?.word || "words";
      return (
        <>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">{wordSet.language} - {wordSet.field}</span>
          </div>
          <p className="text-xs text-muted-foreground ml-6">
            Generated {wordSet.wordEntries?.length || 0} entries ({firstWord}...).
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
            <span className="font-semibold text-foreground">Conversation in {conv.language}</span>
          </div>
          <p className="text-xs text-muted-foreground ml-6 truncate">
            Words: {conv.selectedWords.join(", ")}.
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
              Word Set Details
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Session on <span className="font-semibold text-foreground">{wordSet.field}</span> in <span className="font-semibold text-foreground">{wordSet.language}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center">
              <span className="text-sm font-medium text-muted-foreground w-24">Language:</span>
              <span className="text-sm text-foreground">{wordSet.language}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-muted-foreground w-24">Field:</span>
              <span className="text-sm text-foreground">{wordSet.field}</span>
            </div>
            <div className="flex items-start">
              <span className="text-sm font-medium text-muted-foreground w-24 mt-1">Entries:</span>
              <ScrollArea className="h-48 w-full rounded-md border p-2">
                <ul className="space-y-3">
                  {wordSet.wordEntries?.map((entry, index) => (
                    <li key={index} className="border-b pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
                      <div className="flex items-center justify-between">
                        <strong className="text-sm text-foreground">{entry.word}</strong>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handlePlayAudioInDialog(entry.word, 'word')} aria-label={`Play audio for ${entry.word}`}>
                          <Volume2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                        </Button>
                      </div>
                      <div className="flex items-start justify-between gap-1 mt-1">
                        <p className="text-xs text-muted-foreground flex-grow">{entry.sentence}</p>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handlePlayAudioInDialog(entry.sentence, 'sentence')} aria-label={`Play audio for sentence: ${entry.sentence}`}>
                          <Volume2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-muted-foreground w-24">Date:</span>
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
              Conversation Details
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Conversation practice in <span className="font-semibold text-foreground">{conv.language}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center">
              <span className="text-sm font-medium text-muted-foreground w-32">Language:</span>
              <span className="text-sm text-foreground">{conv.language}</span>
            </div>
             <div className="flex items-start">
              <span className="text-sm font-medium text-muted-foreground w-32 mt-1">Words Used:</span>
              <ScrollArea className="h-20 w-full rounded-md border p-2">
                <ul className="list-disc list-inside text-sm text-foreground">
                  {conv.selectedWords.map((word, index) => (
                    <li key={index}>{word}</li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
            <div className="flex items-start">
              <span className="text-sm font-medium text-muted-foreground w-32 mt-1">Conversation:</span>
              <ScrollArea className="h-32 w-full rounded-md border p-2">
                <p className="text-sm text-foreground whitespace-pre-line">{conv.conversation}</p>
              </ScrollArea>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-muted-foreground w-32">Date:</span>
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
      <h1 className="text-3xl font-bold mb-6 text-primary text-center">Learning Dashboard</h1>
      
      {error && <Alert variant="destructive" className="mb-4"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Words Learned" value={stats.totalWordsLearned.toString()} icon={ListChecks} description="Unique words from generated sets." />
        <StatCard title="Languages Explored" value={stats.languagesCoveredCount.toString()} icon={Languages} description="Unique languages practiced." />
        <StatCard title="Fields Explored" value={stats.fieldsCoveredCount.toString()} icon={BookOpenText} description="Topics covered in word sets." />
        <StatCard title="Total Sessions" value={stats.wordSetsGenerated.toString()} icon={Layers} description="Word sets & conversations." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Learning Overview
            </CardTitle>
            <CardDescription>
              A quick summary of your learning metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2 pr-6 pt-2">
            {chartData.length > 0 ? (
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
                        <Bar dataKey="count" radius={5}>
                            {chartData.map((entry) => (
                                <div key={entry.metric} style={{background: entry.fill}} /> // This is unusual for recharts Bar, fill should be on <Bar/> or individual Cell.
                                // For simplicity, we'll apply fill directly on Bar or handle via CSS if advanced needed.
                                // Recharts <Bar> component takes a `fill` prop directly, or <Cell> subcomponents.
                                // The provided ChartConfig approach should handle colors by mapping data keys.
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No data available for chart.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your last few sessions.
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
                No recent activity yet. <Link href="/words" className="text-primary underline ml-1">Start learning!</Link>
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
              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

    