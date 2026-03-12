"use client";

import * as React from "react";
import { Song, getDisplayTitle } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronLeft, Calendar, User, Music, FileImage, Volume2, Languages } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface SongViewProps {
  song: Song;
  uiLanguage?: 'en' | 'fr';
  onEdit: (song: Song) => void;
  onDelete: (song: Song) => void;
  onBack: () => void;
}

export function SongView({ song, uiLanguage, onEdit, onDelete, onBack }: SongViewProps) {
  const [lyricsLang, setLyricsLang] = React.useState<"en" | "fr">(
    uiLanguage || (song.content?.en?.title ? "en" : "fr")
  );

  // Keep local lyrics language in sync with global UI language if it changes
  React.useEffect(() => {
    if (uiLanguage) {
      setLyricsLang(uiLanguage);
    }
  }, [uiLanguage]);

  const currentContent = song.content?.[lyricsLang];
  const hasContent = !!(currentContent?.title || currentContent?.verses?.length);
  
  const hasEn = !!(song.content?.en?.title || song.content?.en?.verses?.length);
  const hasFr = !!(song.content?.fr?.title || song.content?.fr?.verses?.length);

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
                  #{currentContent?.number || song.content?.en?.number || song.content?.fr?.number || "???"}
                </span>
              </div>
              <CardTitle className="text-4xl font-headline font-bold text-primary leading-tight">
                {currentContent?.title || getDisplayTitle(song)}
              </CardTitle>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center text-muted-foreground text-sm">
                  <User className="w-4 h-4 mr-1.5" />
                  {currentContent?.author || "Anonymous"}
                </div>
                {currentContent?.year && (
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Calendar className="w-4 h-4 mr-1.5" />
                    {currentContent.year}
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
            <div className="px-8 pt-4 border-b bg-muted/5 flex items-center justify-between">
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

              <div className="flex items-center gap-2 pb-2">
                <Languages className="w-3.5 h-3.5 text-muted-foreground" />
                <div className="flex bg-muted rounded-lg p-0.5">
                  <button
                    onClick={() => setLyricsLang("en")}
                    title={!hasEn ? "No English content available" : ""}
                    className={cn(
                      "px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all",
                      lyricsLang === 'en' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground',
                      !hasEn && "opacity-50"
                    )}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLyricsLang("fr")}
                    title={!hasFr ? "Pas de contenu en français" : ""}
                    className={cn(
                      "px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all",
                      lyricsLang === 'fr' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground',
                      !hasFr && "opacity-50"
                    )}
                  >
                    FR
                  </button>
                </div>
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-280px)] min-h-[400px]">
              <TabsContent value="lyrics" className="p-8 m-0">
                {!hasContent ? (
                  <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-300">
                    <Alert className="max-w-md bg-muted/20 border-primary/10">
                      <Languages className="h-4 w-4 text-primary" />
                      <AlertTitle className="font-headline font-semibold text-primary">Content Not Found</AlertTitle>
                      <AlertDescription className="text-muted-foreground">
                        This hymn does not currently have lyrics available in <strong>{lyricsLang === 'en' ? 'English' : 'French'}</strong>. 
                        Please switch to the other language using the toggle or edit the song to add a translation.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="space-y-12 pb-12">
                    {currentContent?.chorus && (
                      <div className="relative p-6 bg-accent/5 rounded-2xl border border-accent/10">
                        <div className="absolute -top-3 left-6 px-3 bg-white border border-accent/20 rounded-full flex items-center gap-1.5 shadow-sm">
                          <Music className="w-3 h-3 text-accent" />
                          <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
                            Chorus ({lyricsLang.toUpperCase()})
                          </span>
                        </div>
                        <p className="text-xl italic leading-relaxed text-foreground whitespace-pre-wrap font-body">
                          {currentContent.chorus}
                        </p>
                      </div>
                    )}

                    <div className="space-y-10">
                      {currentContent?.verses.map((verse, index) => (
                        <div key={index} className="relative">
                          <span className="absolute -top-6 left-0 text-[10px] font-bold text-primary/40 uppercase tracking-widest">
                            Verse {index + 1} ({lyricsLang.toUpperCase()})
                          </span>
                          <p className="text-lg leading-relaxed text-foreground whitespace-pre-wrap font-body">
                            {verse}
                          </p>
                          {index < currentContent.verses.length - 1 && (
                            <Separator className="mt-8 opacity-50 w-24" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="partition" className="p-8 m-0">
                <div className="flex flex-col items-center gap-4 pb-12">
                  <div className="relative w-full aspect-[1/1.4] bg-muted/20 rounded-lg overflow-hidden border">
                    <Image
                      src={song.partitionUrl || ""}
                      alt={`Partition for ${getDisplayTitle(song)}`}
                      fill
                      className="object-contain"
                      unoptimized={song.partitionUrl?.startsWith('data:')}
                    />
                  </div>
                  <Button variant="outline" asChild>
                    <a href={song.partitionUrl} download={`Partition_${currentContent?.number || 'Song'}`} target="_blank" rel="noopener noreferrer">
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
