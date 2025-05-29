
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getStats, type LearningStats, type WordSetRecord, getActivityData } from "@/lib/activityStore";
import { BarChart, BookOpenText, Layers, ListChecks, Clock, Volume2, FileText } from "lucide-react"; // Added Volume2, FileText
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

export default function DashboardClientPage() {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<WordSetRecord[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<WordSetRecord | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      setStats(getStats());
      const activityData = getActivityData();
      setRecentActivity(activityData.learnedItems.slice(0, 10)); // Get last 10 activities
    }
  }, []);

  const handleActivityClick = (activity: WordSetRecord) => {
    setSelectedActivity(activity);
    setIsDetailDialogOpen(true);
  };

  const handlePlaySentenceAudioInDialog = (sentence: string) => {
    // Placeholder for future TTS functionality
    console.log(`Playing audio for sentence: ${sentence}`);
    alert(`Audio playback for the sentence is not yet implemented.`);
  };

  if (!isClient) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
             <Card key={i} className="shadow-lg"><CardHeader><div className="h-6 bg-muted rounded w-1/2"></div></CardHeader><CardContent><div className="h-10 bg-muted rounded w-3/4"></div></CardContent></Card>
          ))}
        </div>
         <Card className="mt-8 shadow-xl"><CardHeader><div className="h-8 bg-muted rounded w-1/3"></div></CardHeader><CardContent><div className="h-40 bg-muted rounded"></div></CardContent></Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground text-lg">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <h1 className="text-3xl font-bold mb-8 text-primary text-center">Your Learning Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard
          title="Total Words Learned"
          value={stats.totalWordsLearned.toString()}
          icon={ListChecks}
          description="Number of unique words across all generated sets."
        />
        <StatCard
          title="Fields Explored"
          value={stats.fieldsCoveredCount.toString()}
          icon={BookOpenText}
          description="Different language & field combinations you've studied."
        />
        <StatCard
          title="Word Sets Generated"
          value={stats.wordSetsGenerated.toString()}
          icon={Layers}
          description="Total learning sessions initiated."
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
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-semibold text-md text-primary-foreground bg-primary px-2 py-1 rounded-md inline-block">{activity.language} - {activity.field}</h4>
                       <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Words: {activity.words.join(", ").substring(0, 50)}{activity.words.join(", ").length > 50 ? "..." : ""}</p>
                     {activity.sentence && (
                      <p className="text-sm text-muted-foreground mt-1 italic">Sentence: {activity.sentence.substring(0,50)}{activity.sentence.length > 50 ? "..." : ""}</p>
                    )}
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
            <DialogHeader>
              <DialogTitle className="text-primary flex items-center gap-2">
                <Layers className="w-5 h-5 text-accent" />
                Activity Details
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Session on <span className="font-semibold text-foreground">{selectedActivity.field}</span> in <span className="font-semibold text-foreground">{selectedActivity.language}</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-muted-foreground w-24">Language:</span>
                <span className="text-sm text-foreground">{selectedActivity.language}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-muted-foreground w-24">Field:</span>
                <span className="text-sm text-foreground">{selectedActivity.field}</span>
              </div>
              <div className="flex items-start">
                <span className="text-sm font-medium text-muted-foreground w-24 mt-1">Words:</span>
                <ScrollArea className="h-24 w-full rounded-md border p-2">
                  <ul className="list-disc list-inside text-sm text-foreground">
                    {selectedActivity.words.map((word, index) => (
                      <li key={index}>{word}</li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
              {selectedActivity.sentence && (
                <div className="flex items-start">
                  <span className="text-sm font-medium text-muted-foreground w-24 mt-1 flex items-center gap-1">
                    <FileText className="w-4 h-4"/> Sentence:
                  </span>
                  <div className="flex-grow flex items-start justify-between gap-2 border rounded-md p-2 bg-secondary/20">
                    <p className="text-sm text-foreground ">{selectedActivity.sentence}</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 shrink-0"
                      onClick={() => handlePlaySentenceAudioInDialog(selectedActivity.sentence)} 
                      aria-label="Play audio for sentence"
                    >
                      <Volume2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex items-center">
                <span className="text-sm font-medium text-muted-foreground w-24">Date:</span>
                <span className="text-sm text-foreground">
                  {new Date(selectedActivity.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
