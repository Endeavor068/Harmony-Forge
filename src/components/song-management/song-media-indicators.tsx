"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Song, songHasAudio, songHasPartition } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FileImage, Volume2 } from "lucide-react";

type SongMediaIndicatorsProps = {
  song: Pick<Song, "partitionUrl" | "audioUrl">;
  uiLanguage?: "en" | "fr";
  /** Liste : icônes compactes ; détail : peut être un peu plus grand */
  size?: "sm" | "md";
  className?: string;
};

const labels = {
  en: {
    partition: "Sheet music attached",
    audio: "Audio recording attached",
    group: "Media attachments",
  },
  fr: {
    partition: "Partition jointe",
    audio: "Audio joint",
    group: "Médias joints",
  },
};

/**
 * Pastilles / icônes indiquant qu’un chant a une partition et/ou un audio
 * (URLs présentes dans le document Firestore).
 */
export function SongMediaIndicators({
  song,
  uiLanguage = "en",
  size = "sm",
  className,
}: SongMediaIndicatorsProps) {
  const hasP = songHasPartition(song);
  const hasA = songHasAudio(song);
  const L = labels[uiLanguage];

  if (!hasP && !hasA) return null;

  const iconClass =
    size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";

  return (
    <TooltipProvider delayDuration={250}>
      <div
        className={cn("flex items-center gap-1.5", className)}
        role="group"
        aria-label={L.group}
      >
        {hasP && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "inline-flex items-center justify-center rounded-md p-1",
                  "bg-accent/15 text-accent ring-1 ring-accent/30",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
                aria-label={L.partition}
              >
                <FileImage className={iconClass} aria-hidden />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{L.partition}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {hasA && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "inline-flex items-center justify-center rounded-md p-1",
                  "bg-primary/10 text-primary ring-1 ring-primary/25",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
                aria-label={L.audio}
              >
                <Volume2 className={iconClass} aria-hidden />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{L.audio}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

type SongMediaFormBadgesProps = {
  hasPartition: boolean;
  hasAudio: boolean;
  uiLanguage?: "en" | "fr";
};

const formLabels = {
  en: {
    partition: "Partition on file",
    audio: "Audio on file",
  },
  fr: {
    partition: "Partition enregistrée",
    audio: "Audio enregistré",
  },
};

/** Badges textuels pour le formulaire (édition / création). */
export function SongMediaFormBadges({
  hasPartition,
  hasAudio,
  uiLanguage = "en",
}: SongMediaFormBadgesProps) {
  const L = formLabels[uiLanguage];
  if (!hasPartition && !hasAudio) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {hasPartition && (
        <Badge
          variant="secondary"
          className="gap-1 font-normal bg-accent/15 text-accent border-accent/25"
        >
          <FileImage className="w-3 h-3" aria-hidden />
          {L.partition}
        </Badge>
      )}
      {hasAudio && (
        <Badge
          variant="secondary"
          className="gap-1 font-normal bg-primary/10 text-primary border-primary/20"
        >
          <Volume2 className="w-3 h-3" aria-hidden />
          {L.audio}
        </Badge>
      )}
    </div>
  );
}
