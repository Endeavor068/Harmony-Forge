
"use client";

import { LyricDisplay } from "@/components/song-management/lyric-display";
import { SongMediaIndicators } from "@/components/song-management/song-media-indicators";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { lyricHasText } from "@/lib/lyric-html";
import { isImageUrl, isMp3Url, isPdfUrl } from "@/lib/media";
import { Song, getDisplayTitle } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Calendar,
  ChevronLeft,
  Edit,
  FileImage,
  Key,
  Languages,
  Loader2,
  Music,
  Trash2,
  User,
  Volume2,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";

interface SongViewProps {
  song: Song;
  uiLanguage?: "en" | "fr";
  onEdit: (song: Song) => void;
  onDelete: (song: Song) => void;
  onBack: () => void;
  /** Supprime le fichier Storage (si applicable) et vide le champ pour ce chant. */
  onSongMediaRemove?: (
    songId: string,
    field: "partitionUrl" | "audioUrl",
    downloadUrl: string
  ) => Promise<void>;
}

export function SongView({
  song,
  uiLanguage,
  onEdit,
  onDelete,
  onBack,
  onSongMediaRemove,
}: SongViewProps) {
  const { toast } = useToast();
  const [lyricsLang, setLyricsLang] = React.useState<"en" | "fr">(
    uiLanguage || (song.content?.en?.title ? "en" : "fr")
  );

  const [viewTab, setViewTab] = React.useState<"lyrics" | "partition" | "audio">("lyrics");
  const [isRemovingMedia, setIsRemovingMedia] = React.useState(false);

  React.useEffect(() => {
    if (uiLanguage) {
      setLyricsLang(uiLanguage);
    }
  }, [uiLanguage]);

  const currentContent = song.content?.[lyricsLang];

  const hasContent = !!(
    currentContent?.title?.trim() ||
    lyricHasText(currentContent?.chorus) ||
    currentContent?.verses?.some((v) => lyricHasText(v))
  );

  const hasEn = !!(
    song.content?.en?.title?.trim() ||
    lyricHasText(song.content?.en?.chorus) ||
    song.content?.en?.verses?.some((v) => lyricHasText(v))
  );
  const hasFr = !!(
    song.content?.fr?.title?.trim() ||
    lyricHasText(song.content?.fr?.chorus) ||
    song.content?.fr?.verses?.some((v) => lyricHasText(v))
  );

  const partitionUrl = song.partitionUrl?.trim() ?? "";
  const audioUrl = song.audioUrl?.trim() ?? "";
  const partitionIsPdf = partitionUrl ? isPdfUrl(partitionUrl) : false;
  const partitionIsImage =
    partitionUrl && !partitionIsPdf ? isImageUrl(partitionUrl) : false;

  React.useEffect(() => {
    if (viewTab === "partition" && !partitionUrl) setViewTab("lyrics");
    if (viewTab === "audio" && !audioUrl) setViewTab("lyrics");
  }, [viewTab, partitionUrl, audioUrl]);

  const handleConfirmRemoveMedia = async (
    field: "partitionUrl" | "audioUrl"
  ) => {
    const url = field === "partitionUrl" ? partitionUrl : audioUrl;
    if (!onSongMediaRemove || !song.id || !url) return;
    setIsRemovingMedia(true);
    try {
      await onSongMediaRemove(song.id, field, url);
      setViewTab("lyrics");
      toast({
        title: uiLanguage === "fr" ? "Média supprimé" : "Media removed",
        description:
          uiLanguage === "fr"
            ? "La partition ou l’audio a été retiré."
            : "Sheet music or audio has been removed.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: uiLanguage === "fr" ? "Échec" : "Failed",
        description:
          uiLanguage === "fr"
            ? "Impossible de supprimer ce média."
            : "Could not remove this media.",
      });
    } finally {
      setIsRemovingMedia(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-10rem)] flex flex-col space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
      <Button variant="ghost" size="sm" className="shrink-0 mb-1 self-start" onClick={onBack}>
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to List
      </Button>

      <Card className="border-primary/10 shadow-xl bg-white overflow-hidden flex-1 flex flex-col min-h-0">
        <CardHeader className="bg-primary/5 pb-6 shrink-0">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-bold font-headline">
                  #{currentContent?.number || song.content?.en?.number || song.content?.fr?.number || "???"}
                </span>
              </div>
              <CardTitle className="text-3xl font-headline font-bold text-primary leading-tight">
                {currentContent?.title || getDisplayTitle(song)}
              </CardTitle>
              <div className="flex flex-wrap gap-4 pt-1">
                <div className="flex items-center text-muted-foreground text-sm">
                  <User className="w-4 h-4 mr-1.5 text-primary/40" />
                  {currentContent?.author || "Anonymous"}
                </div>
                {currentContent?.year && (
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Calendar className="w-4 h-4 mr-1.5 text-primary/40" />
                    {currentContent.year}
                  </div>
                )}
                {currentContent?.key && (
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Key className="w-4 h-4 mr-1.5 text-accent" />
                    <span className="font-semibold">{currentContent.key}</span>
                  </div>
                )}
                <SongMediaIndicators
                  song={song}
                  uiLanguage={uiLanguage ?? "en"}
                  size="md"
                  className="items-center"
                />
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
        <CardContent className="p-0 flex-1 min-h-0 overflow-hidden">
          <Tabs
            value={viewTab}
            onValueChange={(v) =>
              setViewTab(v as "lyrics" | "partition" | "audio")
            }
            className="w-full h-full flex flex-col"
          >
            <div className="px-8 py-3 border-b bg-muted/5 flex items-center justify-between shrink-0">
              <TabsList className="bg-transparent h-10 gap-6 p-0">
                <TabsTrigger
                  value="lyrics"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-headline font-semibold px-1"
                >
                  <Music className="w-4 h-4 mr-2" />
                  Lyrics
                </TabsTrigger>
                {partitionUrl && (
                  <TabsTrigger
                    value="partition"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-headline font-semibold px-1"
                  >
                    <FileImage className="w-4 h-4 mr-2" />
                    Partition
                  </TabsTrigger>
                )}
                {audioUrl && (
                  <TabsTrigger
                    value="audio"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-headline font-semibold px-1"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Audio
                  </TabsTrigger>
                )}
              </TabsList>

              <div className="flex items-center gap-2">
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

            <ScrollArea className="flex-1 min-h-0">
              <TabsContent value="lyrics" className="p-8 m-0 pb-20">
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
                  <div className="space-y-12 pb-20">
                    {lyricHasText(currentContent?.chorus) && (
                      <div className="relative p-6 bg-accent/5 rounded-2xl border border-accent/10">
                        <div className="absolute -top-3 left-6 px-3 bg-white border border-accent/20 rounded-full flex items-center gap-1.5 shadow-sm">
                          <Music className="w-3 h-3 text-accent" />
                          <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
                            Chorus ({lyricsLang.toUpperCase()})
                          </span>
                        </div>
                        <LyricDisplay
                          text={currentContent?.chorus}
                          className="text-xl italic text-foreground"
                        />
                      </div>
                    )}

                    <div className="space-y-10">
                      {(currentContent?.verses ?? [])
                        .map((verse, originalIndex) => ({ verse, originalIndex }))
                        .filter(({ verse }) => lyricHasText(verse))
                        .map(({ verse, originalIndex }, slot, slots) => (
                          <div key={originalIndex} className="relative">
                            <span className="absolute -top-6 left-0 text-[10px] font-bold text-primary/40 uppercase tracking-widest">
                              Verse {originalIndex + 1} ({lyricsLang.toUpperCase()})
                            </span>
                            <LyricDisplay
                              text={verse}
                              className="text-lg text-foreground"
                            />
                            {slot < slots.length - 1 && (
                              <Separator className="mt-8 opacity-50 w-24" />
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="partition" className="p-8 m-0 pb-20">
                <div className="flex flex-col items-center gap-4 max-w-4xl mx-auto">
                  {partitionIsPdf && (
                    <iframe
                      title={`Partition — ${getDisplayTitle(song)}`}
                      src={partitionUrl}
                      className="w-full min-h-[70vh] rounded-lg border bg-muted/20"
                    />
                  )}
                  {partitionIsImage && (
                    <div className="relative w-full aspect-[1/1.4] bg-muted/20 rounded-lg overflow-hidden border">
                      <Image
                        src={partitionUrl}
                        alt={`Partition for ${getDisplayTitle(song)}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 896px) 100vw, 896px"
                        unoptimized={
                          partitionUrl.startsWith("data:") ||
                          partitionUrl.includes("firebasestorage.googleapis.com")
                        }
                      />
                    </div>
                  )}
                  {!partitionIsPdf && !partitionIsImage && partitionUrl && (
                    <Alert className="w-full bg-muted/20 border-primary/10">
                      <FileImage className="h-4 w-4 text-primary" />
                      <AlertTitle className="font-headline">Aperçu non disponible</AlertTitle>
                      <AlertDescription className="space-y-2">
                        <p>Ouvrez le fichier dans un nouvel onglet pour le consulter.</p>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={partitionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Ouvrir la partition
                          </a>
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button variant="outline" asChild>
                      <a
                        href={partitionUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ouvrir / télécharger
                      </a>
                    </Button>
                    {onSongMediaRemove && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isRemovingMedia}
                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          >
                            {isRemovingMedia ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 mr-2" />
                            )}
                            {uiLanguage === "fr" ? "Supprimer" : "Remove"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {uiLanguage === "fr"
                                ? "Retirer la partition ?"
                                : "Remove sheet music?"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {uiLanguage === "fr"
                                ? "Le fichier sur Storage sera supprimé et le lien retiré du chant."
                                : "The Storage file will be deleted and the link removed from this song."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {uiLanguage === "fr" ? "Annuler" : "Cancel"}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() =>
                                handleConfirmRemoveMedia("partitionUrl")
                              }
                            >
                              {uiLanguage === "fr" ? "Supprimer" : "Remove"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="audio" className="p-8 m-0 pb-20">
                <div className="flex flex-col items-center justify-center py-12 gap-8">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <Volume2 className="w-12 h-12 text-primary" />
                  </div>
                  <div className="w-full max-w-md p-6 bg-muted/30 rounded-3xl border">
                    <h3 className="text-center font-headline font-semibold mb-4 text-primary">
                      Lecture audio
                    </h3>
                    <audio controls className="w-full" preload="metadata">
                      <source
                        src={audioUrl}
                        type={isMp3Url(audioUrl) ? "audio/mpeg" : undefined}
                      />
                      Your browser does not support the audio element.
                    </audio>
                    {onSongMediaRemove && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-4 w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                            disabled={isRemovingMedia}
                          >
                            {isRemovingMedia ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Trash2 className="w-4 h-4 mr-2" />
                            )}
                            {uiLanguage === "fr"
                              ? "Supprimer l’audio"
                              : "Remove audio"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {uiLanguage === "fr"
                                ? "Retirer l’audio ?"
                                : "Remove audio?"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {uiLanguage === "fr"
                                ? "Le fichier sur Storage sera supprimé et le lien retiré du chant."
                                : "The Storage file will be deleted and the link removed from this song."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {uiLanguage === "fr" ? "Annuler" : "Cancel"}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() =>
                                handleConfirmRemoveMedia("audioUrl")
                              }
                            >
                              {uiLanguage === "fr" ? "Supprimer" : "Remove"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
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
