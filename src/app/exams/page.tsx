
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileBadge } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ExamsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader className="items-center">
          <FileBadge className="w-16 h-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold text-center text-primary">
            Exams
          </CardTitle>
          <CardDescription className="text-center text-lg mt-2">
            Prepare for speaking exams. This section is currently under construction.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            We're building tools to help you ace your speaking exams. Check back later!
          </p>
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
