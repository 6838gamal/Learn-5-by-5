
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader className="items-center">
          <Wrench className="w-16 h-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold text-center text-primary">
            Settings
          </CardTitle>
          <CardDescription className="text-center text-lg mt-2">
            Customize your LinguaLeap experience. Settings are coming soon!
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            Options for exercise timers, appearance, and more will be available here.
          </p>
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
