
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpellCheck, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { handleGenerateAudio } from "@/app/actions";

interface WordCardProps {
  word: string;
}

const WordCard: React.FC<WordCardProps> = ({ word }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePlayAudio = async () => {
    if (!word) return;
    setIsLoading(true);
    try {
      const result = await handleGenerateAudio(word);
      if (result.audioDataUri) {
        const audio = new Audio(result.audioDataUri);
        audio.play();
      } else {
        toast({
          variant: "destructive",
          title: "Audio Generation Failed",
          description: result.error || "Could not generate audio for the selected word.",
        });
      }
    } catch (e) {
      console.error("Failed to play audio:", e);
      toast({
        variant: "destructive",
        title: "Playback Error",
        description: "An unexpected error occurred while trying to play the audio.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-background to-secondary/30">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-semibold text-primary flex items-center gap-2">
          <SpellCheck className="w-6 h-6 text-accent" />
          {word}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={handlePlayAudio} aria-label={`Play audio for ${word}`} disabled={isLoading}>
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5 text-muted-foreground hover:text-primary" />}
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
