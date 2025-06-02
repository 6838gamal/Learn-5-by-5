
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
import { BarChart, BookOpenText, Layers, ListChecks, Clock, Volume2, FileText, MessageSquare, Loader2, Unlock } from "lucide-react";
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

export default function DashboardClientPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityRecord[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<ActivityRecord | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async (user: User | null) => {
    setIsLoadingData(true);
    setError(null);
    if (user) { // Logged-in user: Fetch from Firestore
      const [statsResult, activityResult] = await Promise.all([
        fetchUserLearningStatsAction({ userId: user.uid }),
        fetchUserActivitiesAction({ userId: user.uid, count: 10 })
      ]);

      if (statsResult.stats) {
        setStats(statsResult.stats);
      } else {
        setError(statsResult.error || "Could not load learning statistics.");
        setStats(getStatsLocal()); // Fallback to local if error
      }

      if (activityResult.activities) {
        setRecentActivity(activityResult.activities);
      } else {
        setError(prevError => `${prevError || ""} ${activityResult.error || "Could not load recent activity."}`.trim());
        setRecentActivity(getActivityDataLocal().learnedItems.slice(0, 10)); // Fallback
      }
    } else if (auth.app.options.apiKey !== "YOUR_API_KEY_HERE") { // Not logged in, real Firebase
         setStats({ totalWordsLearned: 0, fieldsCoveredCount: 0, wordSetsGenerated: 0 });
         setRecentActivity([]);
    }
     else { // Not logged in & test mode (or Firebase not configured): use localStorage
      setStats(getStatsLocal());
      setRecentActivity(getActivityDataLocal().learnedItems.slice(0, 10));
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

  const handlePlaySentenceAudioInDialog = (sentence: string) => {
    alert(`Audio playback for the sentence is not yet implemented.`);
  };
  
  const handlePlayWordAudioInDialog = (word: string) => {
    alert(`Audio playback for the word is not yet implemented.`);
  };

  if (!isClient || isLoadingData) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-0">
        <h1 className="text-3xl font-bold mb-8 text-primary text-center">Your Learning Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {[...Array(3)].map((_, i) => (
             <Card key={i} className="shadow-lg animate-pulse"><CardHeader><div className="h-6 bg-muted rounded w-1/2"></div></CardHeader><CardContent><div className="h-10 bg-muted rounded w-3/4"></div></CardContent></Card>
          ))}
        </div>
         <Card className="mt-8 shadow-xl animate-pulse"><CardHeader><div className="h-8 bg-muted rounded w-1/3"></div></CardHeader><CardContent><div className="h-40 bg-muted rounded flex items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin"/></div></CardContent></Card>
      </div>
    );
  }

  if (!currentUser && auth.app.options.apiKey !== "YOUR_API_KEY_HERE" && isClient && !isLoadingData) {
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
             <p className="text-xs text-muted-foreground mt-2">
              (If you're in test mode with placeholder Firebase keys, some local data might be shown.)
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }


  if (!stats) { // Should only happen briefly or if major error after loading
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground text-lg">Error loading dashboard data. {error}</p>
      </div>
    );
  }
  
  const renderActivityItem = (activity: ActivityRecord) => {
    if (activity.type === 'wordSet') {
      const wordSet = activity as WordSetActivityRecord;
      const firstWord = wordSet.wordEntries?.[0]?.word || "words";
      const firstSentence = wordSet.wordEntries?.[0]?.sentence || "sentences";
      return (
        <>
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-semibold text-md text-primary-foreground bg-primary px-2 py-1 rounded-md inline-block flex items-center gap-1">
              <Layers className="w-4 h-4" /> {wordSet.language} - {wordSet.field}
            </h4>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(wordSet.timestamp), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Generated {wordSet.wordEntries?.length || 0} word entries.
          </p>
          <p className="text-sm text-muted-foreground mt-1 italic">
            e.g., "{firstWord}": {firstSentence.substring(0,50)}{firstSentence.length > 50 ? "..." : ""}
          </p>
        </>
      );
    } else if (activity.type === 'conversation') {
      const conv = activity as ConversationActivityRecord;
      return (
        <>
          <div className="flex justify-between items-center mb-1">
             <h4 className="font-semibold text-md text-primary-foreground bg-primary px-2 py-1 rounded-md inline-block flex items-center gap-1">
              <MessageSquare className="w-4 h-4" /> Conversation in {conv.language}
            </h4>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(conv.timestamp), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Using words: {conv.selectedWords.join(", ").substring(0, 40)}{conv.selectedWords.join(", ").length > 40 ? "..." : ""}</p>
          <p className="text-sm text-muted-foreground mt-1 italic">Script: {conv.conversation.substring(0,50)}{conv.conversation.length > 50 ? "..." : ""}</p>
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
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 shrink-0"
                          onClick={() => handlePlayWordAudioInDialog(entry.word)} 
                          aria-label={`Play audio for ${entry.word}`}
                        >
                          <Volume2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                        </Button>
                      </div>
                      <div className="flex items-start justify-between gap-1 mt-1">
                        <p className="text-xs text-muted-foreground flex-grow">{entry.sentence}</p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 shrink-0"
                          onClick={() => handlePlaySentenceAudioInDialog(entry.sentence)} 
                          aria-label={`Play audio for sentence: ${entry.sentence}`}
                        >
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
                {new Date(wordSet.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
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
                {new Date(conv.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <h1 className="text-3xl font-bold mb-8 text-primary text-center">Your Learning Dashboard</h1>
      
      {error && <Alert variant="destructive" className="mb-4"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard
          title="Total Words Learned"
          value={stats.totalWordsLearned.toString()}
          icon={ListChecks}
          description="Unique words from generated word sets."
        />
        <StatCard
          title="Fields Explored"
          value={stats.fieldsCoveredCount.toString()}
          icon={BookOpenText}
          description="Language & field combinations for word sets."
        />
        <StatCard
          title="Word Sets Generated"
          value={stats.wordSetsGenerated.toString()}
          icon={Layers}
          description="Total word learning sessions initiated."
        />
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary flex items-center gap-2">
            <BarChart className="w-6 h-6 text-accent" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your last few learning sessions. Click on an item to see details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <ScrollArea className="h-[300px] pr-3">
              <ul className="space-y-4">
                {recentActivity.map((activity) => (
                  <li 
                    key={activity.id} 
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleActivityClick(activity)}
                  >
                    {renderActivityItem(activity)}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground text-center py-4">No recent activity recorded yet. Start learning to see your progress!</p>
          )}
        </CardContent>
      </Card>

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
