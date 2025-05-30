
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SoundsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader className="items-center">
          <Mic className="w-16 h-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold text-center text-primary">
            Sounds Practice
          </CardTitle>
          <CardDescription className="text-center text-lg mt-2">
            This section is under construction. Come back soon to practice pronouncing sounds!
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            We are working hard to bring you the best sound pronunciation exercises.
          </p>
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
