
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpellCheck, Volume2 } from "lucide-react"; // Added Volume2
import { Button } from "@/components/ui/button";

interface WordCardProps {
  word: string;
}

const WordCard: React.FC<WordCardProps> = ({ word }) => {
  const handlePlayAudio = () => {
    // Placeholder for future TTS functionality
    console.log(`Playing audio for ${word}`);
    // In a real implementation, you would call a TTS service here
    // and play the returned audio.
    alert(`Audio playback for "${word}" is not yet implemented.`);
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-background to-secondary/30">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-semibold text-primary flex items-center gap-2">
          <SpellCheck className="w-6 h-6 text-accent" />
          {word}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={handlePlayAudio} aria-label={`Play audio for ${word}`}>
          <Volume2 className="w-5 h-5 text-muted-foreground hover:text-primary" />
        </Button>
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
