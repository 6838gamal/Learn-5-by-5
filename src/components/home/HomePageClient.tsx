
"use client";

import React from "react";
import FeatureCard from "./FeatureCard";
import {
  Mic,
  NotebookTabs,
  ClipboardList,
  MessagesSquare,
  FileBadge,
  Wrench,
  Download,
  BookOpenText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "../ui/button";

// Placeholder for custom icons if needed, matching the screenshot more closely
// For now, using Lucide icons.

const features = [
  {
    icon: Mic,
    title: "Sounds",
    description: "Watch videos and practice pronouncing sounds.",
    href: "/sounds", // Placeholder link
    dataAiHint: "microphone audio",
  },
  {
    icon: NotebookTabs,
    title: "Words",
    description: "Practice pronouncing common words. Generate new word sets.",
    href: "/words", // Links to the word generation page
    dataAiHint: "notebook vocabulary",
  },
  {
    icon: ClipboardList,
    title: "Exercises",
    description: "Practice listening to sounds and sentences in various exercise types.",
    href: "/exercises", // Placeholder link
    dataAiHint: "clipboard tasks",
  },
  {
    icon: MessagesSquare,
    title: "Conversations",
    description: "Improve your conversation skills for different situations.",
    href: "/conversations", // Placeholder link
    dataAiHint: "chat bubbles",
  },
  {
    icon: FileBadge, // Using FileBadge as a stand-in for exams/certification
    title: "Exams",
    description: "Prepare yourself for different types of speaking exams.",
    href: "/exams", // Placeholder link
    dataAiHint: "certificate exam",
  },
  {
    icon: Wrench,
    title: "Settings",
    description: "Exercise timer, appearance, and more.",
    href: "/settings", // Placeholder link
    dataAiHint: "tool settings",
  },
];

export default function HomePageClient() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-2">Welcome to LinguaLeap!</h1>
        <p className="text-lg text-muted-foreground">
          Your journey to language mastery starts here. Explore features below.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            href={feature.href}
            dataAiHint={feature.dataAiHint}
          />
        ))}
      </div>

      <Card className="text-center shadow-lg bg-gradient-to-br from-secondary/30 to-background p-6">
        <CardHeader className="items-center pb-2 pt-2">
          <Download className="w-16 h-16 text-primary mb-3" />
          <CardTitle className="text-2xl font-semibold text-primary">
            Download LinguaLeap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-md text-muted-foreground mb-6">
            Take your learning offline. Download the LinguaLeap app for uninterrupted practice.
            (This is a conceptual feature for this prototype)
          </CardDescription>
          <Button className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 text-lg font-medium rounded-md shadow-sm hover:shadow-md transition-all">
            Download App
          </Button>
        </CardContent>
      </Card>
       <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold text-primary mb-4">Quick Access to Word Generation</h2>
        <p className="text-muted-foreground mb-4">Jump directly into learning new vocabulary.</p>
        <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/words">
                <BookOpenText className="mr-2 h-5 w-5" /> Generate Words & Sentences
            </Link>
        </Button>
      </div>
    </div>
  );
}
