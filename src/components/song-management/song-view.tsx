"use client";

import { Song } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronLeft, Calendar, User, Music } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface SongViewProps {
  song: Song;
  onEdit: (song: Song) => void;
  onDelete: (song: Song) => void;
  onBack: () => void;
}

export function SongView({ song, onEdit, onDelete, onBack }: SongViewProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <Button variant="ghost" className="mb-2" onClick={onBack}>
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to List
      </Button>

      <Card className="border-primary/10 shadow-xl bg-white overflow-hidden">
        <CardHeader className="bg-primary/5 pb-8">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-bold font-headline">
                  #{song.number}
                </span>
              </div>
              <CardTitle className="text-4xl font-headline font-bold text-primary leading-tight">
                {song.title}
              </CardTitle>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center text-muted-foreground text-sm">
                  <User className="w-4 h-4 mr-1.5" />
                  {song.author || "Anonymous"}
                </div>
                {song.year && (
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Calendar className="w-4 h-4 mr-1.5" />
                    {song.year}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="icon" onClick={() => onEdit(song)} className="border-accent/30 text-accent hover:bg-accent hover:text-white">
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => onDelete(song)} className="border-destructive/30 text-destructive hover:bg-destructive hover:text-white">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[65vh] p-8">
            <div className="space-y-12">
              {/* Chorus (if it exists) */}
              {song.chorus && (
                <div className="relative p-6 bg-accent/5 rounded-2xl border border-accent/10">
                  <div className="absolute -top-3 left-6 px-3 bg-white border border-accent/20 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Music className="w-3 h-3 text-accent" />
                    <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
                      Chorus
                    </span>
                  </div>
                  <p className="text-xl italic leading-relaxed text-foreground whitespace-pre-wrap font-body">
                    {song.chorus}
                  </p>
                </div>
              )}

              {/* Verses */}
              <div className="space-y-10">
                {song.verses.map((verse, index) => (
                  <div key={index} className="relative">
                    <span className="absolute -top-6 left-0 text-[10px] font-bold text-primary/40 uppercase tracking-widest">
                      Verse {index + 1}
                    </span>
                    <p className="text-lg leading-relaxed text-foreground whitespace-pre-wrap font-body">
                      {verse}
                    </p>
                    {index < song.verses.length - 1 && (
                      <Separator className="mt-8 opacity-50 w-24" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
