import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpellCheck } from "lucide-react";

interface WordCardProps {
  word: string;
}

const WordCard: React.FC<WordCardProps> = ({ word }) => {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-background to-secondary/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-semibold text-primary flex items-center gap-2">
          <SpellCheck className="w-6 h-6 text-accent" />
          {word}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Explore the definition and usage of this word.
        </p>
        {/* Placeholder for definition and example if available in future */}
      </CardContent>
    </Card>
  );
};

export default WordCard;
