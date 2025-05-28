
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getStats, type LearningStats, type WordSetRecord, getActivityData } from "@/lib/activityStore";
import { BarChart, BookOpenText, Layers, ListChecks, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import StatCard from "./StatCard";

export default function DashboardClientPage() {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<WordSetRecord[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Ensure localStorage access only on client
    if (typeof window !== "undefined") {
      setStats(getStats());
      const activityData = getActivityData();
      setRecentActivity(activityData.learnedItems.slice(0, 5)); // Get last 5 activities
    }
  }, []);

  if (!isClient) {
    return ( // Basic skeleton or loading state for SSR/initial render
      <div className="container mx-auto py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
             <Card key={i} className="shadow-lg"><CardHeader><div className="h-6 bg-muted rounded w-1/2"></div></CardHeader><CardContent><div className="h-10 bg-muted rounded w-3/4"></div></CardContent></Card>
          ))}
        </div>
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
            Your last few learning sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <ScrollArea className="h-[300px]">
              <ul className="space-y-4">
                {recentActivity.map((activity) => (
                  <li key={activity.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-semibold text-md text-primary-foreground bg-primary px-2 py-1 rounded-md inline-block">{activity.language} - {activity.field}</h4>
                       <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Words: {activity.words.join(", ")}</p>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground text-center py-4">No recent activity recorded yet. Start learning to see your progress!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
