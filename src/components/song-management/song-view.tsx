"use client";

import { Song } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronLeft, Calendar, User, Music, FileImage, Volume2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

interface SongViewProps {
  song: Song;
  onEdit: (song: Song) => void;
  onDelete: (song: Song) => void;
  onBack: () => void;
}

export function SongView({ song, onEdit, onDelete, onBack }: SongViewProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
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
          <Tabs defaultValue="lyrics" className="w-full">
            <div className="px-8 pt-4 border-b bg-muted/5">
              <TabsList className="bg-transparent h-12 gap-6 p-0">
                <TabsTrigger 
                  value="lyrics" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-headline font-semibold"
                >
                  <Music className="w-4 h-4 mr-2" />
                  Lyrics
                </TabsTrigger>
                {song.partitionUrl && (
                  <TabsTrigger 
                    value="partition" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-headline font-semibold"
                  >
                    <FileImage className="w-4 h-4 mr-2" />
                    Partition
                  </TabsTrigger>
                )}
                {song.audioUrl && (
                  <TabsTrigger 
                    value="audio" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-headline font-semibold"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Audio
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <ScrollArea className="h-[65vh]">
              <TabsContent value="lyrics" className="p-8 m-0">
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
              </TabsContent>

              <TabsContent value="partition" className="p-8 m-0">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-full aspect-[1/1.4] bg-muted/20 rounded-lg overflow-hidden border">
                    <Image
                      src={song.partitionUrl || ""}
                      alt={`Partition for ${song.title}`}
                      fill
                      className="object-contain"
                      unoptimized={song.partitionUrl?.startsWith('data:')}
                    />
                  </div>
                  <Button variant="outline" asChild>
                    <a href={song.partitionUrl} download={`Partition_${song.title}`} target="_blank" rel="noopener noreferrer">
                      View Full Size
                    </a>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="audio" className="p-8 m-0">
                <div className="flex flex-col items-center justify-center h-full py-20 gap-8">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                    <Volume2 className="w-12 h-12 text-primary" />
                  </div>
                  <div className="w-full max-w-md p-6 bg-muted/30 rounded-3xl border">
                    <h3 className="text-center font-headline font-semibold mb-4 text-primary">Audio Playback</h3>
                    <audio controls className="w-full">
                      <source src={song.audioUrl} />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
