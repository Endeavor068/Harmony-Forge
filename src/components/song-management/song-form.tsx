"use client";

import { LyricEditor } from "@/components/song-management/lyric-editor";
import { SongMediaFormBadges } from "@/components/song-management/song-media-indicators";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, useStorage, useUser } from "@/firebase";
import { firebaseConfig } from "@/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { deleteFirebaseStorageObjectByUrl } from "@/lib/storage-helpers";
import {
  NewSong,
  Song,
  SongContent,
  songHasAudio,
  songHasPartition,
} from "@/lib/types";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { FileImage, Key, Languages, Loader2, Music, Plus, Save, Trash2, Volume2, X } from "lucide-react";
import * as React from "react";

const PARTITION_ACCEPT =
  "application/pdf,image/png,image/jpeg,image/gif,image/webp,.pdf,.png,.jpg,.jpeg";
/** Pas de `audio/mp3` (non standard) : évite les sélecteurs vides sur macOS/Safari. */
const AUDIO_ACCEPT = ".mp3,audio/mpeg,audio/*";

function resolvePartitionContentType(file: File): string | null {
  if (file.type === "application/pdf" || file.type.startsWith("image/")) {
    return file.type;
  }
  const n = file.name.toLowerCase();
  if (n.endsWith(".pdf")) return "application/pdf";
  if (n.endsWith(".png")) return "image/png";
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
  if (n.endsWith(".gif")) return "image/gif";
  if (n.endsWith(".webp")) return "image/webp";
  return null;
}

/** MP3 uniquement (exigence produit : mobile + dashboard). */
function resolveAudioContentType(file: File): string | null {
  if (file.type === "audio/mpeg" || file.type === "audio/mp3") {
    return "audio/mpeg";
  }
  if (file.name.toLowerCase().endsWith(".mp3")) return "audio/mpeg";
  return null;
}

/** Numéro d’hymne utilisable dans un chemin Storage (sans caractères problématiques). */
function sanitizeHymnNumberForPath(raw: string): string {
  const t = raw.replace(/#/g, "").trim();
  if (!t) return "unknown";
  const out = t
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return out || "unknown";
}

/**
 * Nom d’objet Storage : `song_{numéro}.ext` ou `partition_{numéro}.ext`.
 * Le numéro vient des champs EN/FR (priorité à la langue active du formulaire).
 */
function buildStorageObjectName(
  formData: NewSong | Song,
  preferLang: "en" | "fr",
  field: "partitionUrl" | "audioUrl",
  ext: string
): string {
  const en = formData.content?.en?.number?.trim();
  const fr = formData.content?.fr?.number?.trim();
  const primary =
    preferLang === "en" ? en || fr || "" : fr || en || "";
  const numberPart = sanitizeHymnNumberForPath(primary || en || fr || "unknown");
  const prefix = field === "partitionUrl" ? "partition" : "song";
  const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "") || "dat";
  return `${prefix}_${numberPart}.${safeExt}`;
}

interface SongFormProps {
  song?: Song | null;
  onSave: (song: Song | NewSong) => void;
  onCancel: () => void;
  uiLanguage?: "en" | "fr";
  /**
   * Après un upload Storage réussi : persiste l’URL HTTPS Firestore (`partitionUrl` / `audioUrl`).
   * Uniquement en édition (chant déjà enregistré avec un `id`).
   */
  onMediaUploaded?: (
    songId: string,
    field: "partitionUrl" | "audioUrl",
    downloadUrl: string
  ) => void;
  /** Supprime le fichier Storage (si applicable) et vide le champ dans Firestore pour ce chant. */
  onSongMediaRemove?: (
    songId: string,
    field: "partitionUrl" | "audioUrl",
    downloadUrl: string
  ) => Promise<void>;
}

const emptyContent = (): SongContent => ({
  title: "",
  number: "",
  author: "",
  year: "",
  key: "",
  verses: [""],
  chorus: "",
});

export function SongForm({
  song,
  onSave,
  onCancel,
  uiLanguage = "en",
  onMediaUploaded,
  onSongMediaRemove,
}: SongFormProps) {
  const auth = useAuth();
  const storage = useStorage();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = React.useState(false);

  const [formData, setFormData] = React.useState<NewSong | Song>(
    song || {
      content: {
        en: emptyContent(),
        fr: emptyContent(),
      },
      partitionUrl: "",
      audioUrl: "",
    }
  );

  const [activeLang, setActiveLang] = React.useState<"en" | "fr">("en");

  const partitionLocked = Boolean(formData.partitionUrl?.trim());
  const audioLocked = Boolean(formData.audioUrl?.trim());

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'partitionUrl' | 'audioUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === "partitionUrl" && partitionLocked) {
      e.target.value = "";
      return;
    }
    if (field === "audioUrl" && audioLocked) {
      e.target.value = "";
      return;
    }

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please wait for anonymous sign-in to complete before uploading files.",
      });
      return;
    }

    if (!storage) {
      toast({
        variant: "destructive",
        title: "Storage Error",
        description: "Firebase Storage is not initialized.",
      });
      return;
    }

    const contentType =
      field === "partitionUrl"
        ? resolvePartitionContentType(file)
        : resolveAudioContentType(file);

    if (!contentType) {
      toast({
        variant: "destructive",
        title: "Format non pris en charge",
        description:
          field === "partitionUrl"
            ? "Utilisez un PDF ou une image (PNG, JPEG, GIF, WebP)."
            : "Utilisez un fichier MP3.",
      });
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    try {
      await auth.authStateReady();
      const signedIn = auth.currentUser;
      if (!signedIn) {
        toast({
          variant: "destructive",
          title: "Session indisponible",
          description:
            "Connexion Firebase non prête. Réessayez dans une seconde ou rechargez la page.",
        });
        return;
      }
      await signedIn.getIdToken(true);

      const ext =
        field === "partitionUrl"
          ? contentType === "application/pdf"
            ? "pdf"
            : (file.name.split(".").pop() || "img").replace(/[^a-z0-9]/gi, "")
          : "mp3";
      const fileName = buildStorageObjectName(
        formData,
        activeLang,
        field,
        ext
      );
      const folder = field === "partitionUrl" ? "partitions" : "audio";
      const storageRef = ref(storage, `songs/${folder}/${fileName}`);

      const snapshot = await uploadBytes(storageRef, file, {
        contentType,
      });
      const downloadUrl = await getDownloadURL(snapshot.ref);

      setFormData((prev) => ({ ...prev, [field]: downloadUrl }));

      if (song?.id) {
        onMediaUploaded?.(song.id, field, downloadUrl);
      }

      toast({
        title: "Upload Successful",
        description: `Stored as ${fileName}`,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      const code = error?.code as string | undefined;
      const isRuleDenied = code === "storage/unauthorized";
      if (process.env.NODE_ENV === "development" && isRuleDenied) {
        console.warn("[HarmonyForge Storage]", {
          uid: auth.currentUser?.uid ?? null,
          isAnonymous: auth.currentUser?.isAnonymous,
          storageBucket: firebaseConfig.storageBucket,
          rulesUrl: `https://console.firebase.google.com/project/${firebaseConfig.projectId}/storage/rules`,
        });
      }
      const rulesUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/storage/rules`;
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: isRuleDenied
          ? `Règles Storage : le serveur refuse l’écriture (souvent règles non publiées ou trop strictes). Ouvre la console, onglet Storage → Règles, colle le contenu de storage.rules du dépôt, puis Publier. Lien direct : ${rulesUrl} — Vérifie aussi que Storage est bien activé (première ouverture) et que la connexion anonyme est activée dans Authentication.`
          : error.message || "There was an error uploading your file.",
      });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirmRemoveMedia = async (field: "partitionUrl" | "audioUrl") => {
    const url = formData[field]?.trim() ?? "";
    if (!url) return;
    setIsUploading(true);
    try {
      if (song?.id && onSongMediaRemove) {
        await onSongMediaRemove(song.id, field, url);
      } else if (storage) {
        await deleteFirebaseStorageObjectByUrl(storage, url);
      }
      setFormData((prev) => ({ ...prev, [field]: "" }));
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
      setIsUploading(false);
    }
  };

  const handleContentChange = (lang: "en" | "fr", field: keyof SongContent, value: any) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [lang]: {
          ...(prev.content[lang] || emptyContent()),
          [field]: value,
        },
      },
    }));
  };

  const handleVerseChange = (lang: "en" | "fr", index: number, value: string) => {
    const currentContent = formData.content[lang] || emptyContent();
    const newVerses = [...currentContent.verses];
    newVerses[index] = value;
    handleContentChange(lang, "verses", newVerses);
  };

  const addVerse = (lang: "en" | "fr") => {
    const currentContent = formData.content[lang] || emptyContent();
    handleContentChange(lang, "verses", [...currentContent.verses, ""]);
  };

  const removeVerse = (lang: "en" | "fr", index: number) => {
    const currentContent = formData.content[lang] || emptyContent();
    handleContentChange(lang, "verses", currentContent.verses.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enTitle = formData.content.en?.title;
    const frTitle = formData.content.fr?.title;
    if (!enTitle && !frTitle) {
      toast({
        variant: "destructive",
        title: "Missing Title",
        description: "Please provide at least one title (English or French)",
      });
      return;
    }
    onSave(formData);
  };

  const renderLyricInputs = (lang: "en" | "fr") => {
    const content = formData.content[lang] || emptyContent();
    const songKey =
      "id" in formData && formData.id ? formData.id : "new";
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor={`${lang}-title`}>Song Title ({lang.toUpperCase()})</Label>
            <Input
              id={`${lang}-title`}
              value={content.title}
              onChange={(e) => handleContentChange(lang, "title", e.target.value)}
              placeholder={`Enter ${lang === 'en' ? 'English' : 'French'} title`}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${lang}-number`}>Number ({lang.toUpperCase()})</Label>
            <Input
              id={`${lang}-number`}
              value={content.number}
              onChange={(e) => handleContentChange(lang, "number", e.target.value)}
              placeholder="e.g. 001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${lang}-year`}>Year ({lang.toUpperCase()})</Label>
            <Input
              id={`${lang}-year`}
              value={content.year}
              onChange={(e) => handleContentChange(lang, "year", e.target.value)}
              placeholder="Year"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${lang}-author`}>Author / Composer ({lang.toUpperCase()})</Label>
            <Input
              id={`${lang}-author`}
              value={content.author}
              onChange={(e) => handleContentChange(lang, "author", e.target.value)}
              placeholder="Artist name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${lang}-key`}>Musical Key ({lang.toUpperCase()})</Label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id={`${lang}-key`}
                value={content.key || ""}
                onChange={(e) => handleContentChange(lang, "key", e.target.value)}
                placeholder="e.g. G Major"
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 p-4 bg-accent/5 rounded-xl border border-accent/10">
          <div className="flex items-center gap-2 mb-2">
            <Music className="w-4 h-4 text-accent" />
            <Label className="text-sm font-bold text-accent uppercase tracking-wider">
              Chorus ({lang.toUpperCase()})
            </Label>
          </div>
          <LyricEditor
            editorKey={`${songKey}-${lang}-chorus`}
            value={content.chorus || ""}
            onChange={(html) => handleContentChange(lang, "chorus", html)}
            placeholder={
              uiLanguage === "fr"
                ? "Saisir le refrain…"
                : "Enter chorus text…"
            }
            variant="chorus"
            disabled={isUploading}
            className="border-accent/20 focus-within:border-accent/40"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-headline">Verses ({lang.toUpperCase()})</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => addVerse(lang)} className="text-primary hover:text-primary/90 border-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Add Verse
            </Button>
          </div>

          {content.verses.map((verse, index) => (
            <div key={index} className="relative group animate-in fade-in slide-in-from-left-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Verse {index + 1}</Label>
                  {content.verses.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeVerse(lang, index)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
                <LyricEditor
                  editorKey={`${songKey}-${lang}-verse-${index}`}
                  value={verse}
                  onChange={(html) => handleVerseChange(lang, index, html)}
                  placeholder={
                    uiLanguage === "fr"
                      ? "Saisir le couplet…"
                      : "Enter verse text…"
                  }
                  disabled={isUploading}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-8">
        {/* Media Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-2xl border border-primary/5">
          <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-primary/5">
            <p className="text-xs font-medium text-muted-foreground">
              {uiLanguage === "fr"
                ? "Médias (partition + audio)"
                : "Media (sheet + audio)"}
            </p>
            <SongMediaFormBadges
              hasPartition={songHasPartition(formData)}
              hasAudio={songHasAudio(formData)}
              uiLanguage={uiLanguage}
            />
          </div>
          <div className="space-y-3">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <FileImage className="w-4 h-4 text-primary" />
                  <Label className="text-sm font-semibold text-primary/80">
                    Partition (PDF ou image)
                  </Label>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground pl-6">
                Colonne de gauche — pas les fichiers audio.
              </p>
            </div>
            {partitionLocked ? (
              <div className="rounded-lg border border-dashed border-primary/35 bg-muted/50 p-3 space-y-3">
                <p className="text-[10px] text-muted-foreground leading-snug">
                  {uiLanguage === "fr"
                    ? "Une partition est déjà associée à ce chant. Supprimez-la pour pouvoir coller une autre URL ou en envoyer une nouvelle."
                    : "Sheet music is already attached. Remove it before pasting another URL or uploading a new file."}
                </p>
                <p
                  className="text-xs font-medium text-foreground/90 break-all"
                  title={formData.partitionUrl}
                >
                  {formData.partitionUrl}
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploading || isUserLoading}
                      className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      {uiLanguage === "fr" ? "Supprimer la partition" : "Remove sheet music"}
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
                        onClick={() => handleConfirmRemoveMedia("partitionUrl")}
                      >
                        {uiLanguage === "fr" ? "Supprimer" : "Remove"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : (
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-8">
                  <TabsTrigger value="url" className="text-xs">
                    URL
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="text-xs">
                    Upload
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="mt-2">
                  <Input
                    name="partitionUrl"
                    value={formData.partitionUrl || ""}
                    onChange={handleUrlChange}
                    placeholder="URL PDF ou image..."
                    className="h-8 text-xs"
                  />
                </TabsContent>
                <TabsContent value="upload" className="mt-2 space-y-1">
                  <p className="text-[10px] text-muted-foreground">
                    PDF, PNG, JPEG, GIF ou WebP.
                  </p>
                  <div className="relative">
                    <Input
                      type="file"
                      accept={PARTITION_ACCEPT}
                      disabled={isUploading || isUserLoading || !user}
                      onChange={(e) => handleFileUpload(e, "partitionUrl")}
                      className="h-8 text-xs cursor-pointer"
                    />
                    {(isUploading || isUserLoading) && (
                      <div className="absolute inset-y-0 right-2 flex items-center">
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-primary" />
                <Label className="text-sm font-semibold text-primary/80">
                  Audio MP3
                </Label>
              </div>
              <p className="text-[10px] text-muted-foreground pl-6">
                Colonne de droite — choisir un fichier .mp3.
              </p>
            </div>
            {audioLocked ? (
              <div className="rounded-lg border border-dashed border-primary/35 bg-muted/50 p-3 space-y-3">
                <p className="text-[10px] text-muted-foreground leading-snug">
                  {uiLanguage === "fr"
                    ? "Un fichier audio est déjà associé à ce chant. Supprimez-le pour pouvoir coller une autre URL ou en envoyer un nouveau."
                    : "Audio is already attached. Remove it before pasting another URL or uploading a new file."}
                </p>
                <p
                  className="text-xs font-medium text-foreground/90 break-all"
                  title={formData.audioUrl}
                >
                  {formData.audioUrl}
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploading || isUserLoading}
                      className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      {uiLanguage === "fr" ? "Supprimer l’audio" : "Remove audio"}
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
                        onClick={() => handleConfirmRemoveMedia("audioUrl")}
                      >
                        {uiLanguage === "fr" ? "Supprimer" : "Remove"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : (
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-8">
                  <TabsTrigger value="url" className="text-xs">
                    URL
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="text-xs">
                    Upload
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="mt-2">
                  <Input
                    name="audioUrl"
                    value={formData.audioUrl || ""}
                    onChange={handleUrlChange}
                    placeholder="URL MP3 ou flux audio..."
                    className="h-8 text-xs"
                  />
                </TabsContent>
                <TabsContent value="upload" className="mt-2 space-y-1">
                  <p className="text-[10px] text-muted-foreground">
                    Fichiers audio ; seul le MP3 est accepté à l’envoi.
                  </p>
                  <div className="relative">
                    <Input
                      type="file"
                      accept={AUDIO_ACCEPT}
                      disabled={isUploading || isUserLoading || !user}
                      onChange={(e) => handleFileUpload(e, "audioUrl")}
                      className="h-8 text-xs cursor-pointer"
                    />
                    {(isUploading || isUserLoading) && (
                      <div className="absolute inset-y-0 right-2 flex items-center">
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>

        {/* Lyrics & Metadata Tabs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Languages className="w-5 h-5 text-primary" />
            <Label className="text-lg font-headline">Bilingual Content & Metadata</Label>
          </div>
          <Tabs value={activeLang} onValueChange={(val) => setActiveLang(val as "en" | "fr")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="en">English (EN)</TabsTrigger>
              <TabsTrigger value="fr">French (FR)</TabsTrigger>
            </TabsList>
            <TabsContent value="en" className="mt-6">
              {renderLyricInputs("en")}
            </TabsContent>
            <TabsContent value="fr" className="mt-6">
              {renderLyricInputs("fr")}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-3 z-10">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isUploading}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isUploading}
          className="bg-accent hover:bg-accent/90 text-accent-foreground min-w-[120px]"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {song ? "Update Song" : "Save Song"}
        </Button>
      </div>
    </form>
  );
}