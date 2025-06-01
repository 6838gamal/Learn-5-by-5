
"use client";

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction, ChevronLeft, Home, Award } from "lucide-react";

// Helper function to convert slug to title
function slugToTitle(slug: string): string {
  if (!slug) return "Exam";
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examNameSlug = typeof params.examName === 'string' ? params.examName : '';
  const examTitle = slugToTitle(examNameSlug);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-xl mx-auto shadow-xl">
        <CardHeader className="items-center text-center">
          <Award className="w-16 h-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold text-primary">
            {examTitle}
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            This exam/assessment is currently under construction.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            We're working hard to bring you this interactive assessment. Please check back soon!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={() => router.back()} variant="outline" className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Back to Exams List
            </Button>
            <Button asChild className="flex items-center gap-2">
              <Link href="/">
                <Home className="w-4 h-4" /> Return to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
