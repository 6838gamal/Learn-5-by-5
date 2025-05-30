
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessagesSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ConversationsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader className="items-center">
          <MessagesSquare className="w-16 h-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold text-center text-primary">
            Conversations
          </CardTitle>
          <CardDescription className="text-center text-lg mt-2">
            Improve your conversation skills for different situations. Feature under development.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            Practice real-life conversations soon. Stay tuned!
          </p>
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
