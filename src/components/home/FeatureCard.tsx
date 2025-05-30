
"use client";

import type React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>; // Allow Lucide or custom SVG
  title: string;
  description: string;
  href: string;
  actionText?: string;
  imageSrc?: string;
  dataAiHint?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: IconComponent,
  title,
  description,
  href,
  actionText = "Open",
  imageSrc, // Not used in this version based on screenshot, but good for future
  dataAiHint
}) => {
  return (
    <Card className="flex flex-col text-center shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card h-full">
      <CardHeader className="items-center pb-2 pt-6">
        <div className="mb-3 text-primary">
          {typeof IconComponent === 'string' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={IconComponent} alt={`${title} icon`} className="w-16 h-16" data-ai-hint={dataAiHint} />
          ) : (
             <IconComponent className="w-14 h-14 md:w-16 md:h-16 text-primary" />
          )}
        </div>
        <CardTitle className="text-xl font-semibold text-primary-foreground bg-primary/10 px-3 py-1 rounded-md w-auto inline-block">
            {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <CardDescription className="text-sm text-muted-foreground mb-4 px-2 min-h-[3em]">
          {description}
        </CardDescription>
        <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 text-base font-medium rounded-md shadow-sm hover:shadow-md transition-all">
          <Link href={href}>{actionText}</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
