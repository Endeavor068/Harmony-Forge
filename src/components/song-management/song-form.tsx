"use client";

import * as React from "react";
import { Plus, Trash2, Save, X, Music, FileImage, Volume2, Languages, Key, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Song, NewSong, SongContent } from "@/lib/types";
import { useStorage, useUser } from "@/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";

interface SongFormProps {
  song?: Song | null;
  onSave: (song: Song | NewSong) => void;
  onCancel: () => void;
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

export function SongForm({ song, onSave, onCancel }: SongFormProps) {
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'partitionUrl' | 'audioUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    setIsUploading(true);
    try {
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const folder = field === 'partitionUrl' ? 'partitions' : 'audio';
      const storageRef = ref(storage, `songs/${folder}/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      
      setFormData((prev) => ({ ...prev, [field]: downloadUrl }));
      
      toast({
        title: "Upload Successful",
        description: `${file.name} has been uploaded.`,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "There was an error uploading your file.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
            <Label htmlFor={`${lang}-chorus`} className="text-sm font-bold text-accent uppercase tracking-wider">Chorus ({lang.toUpperCase()})</Label>
          </div>
          <Textarea
            id={`${lang}-chorus`}
            value={content.chorus || ""}
            onChange={(e) => handleContentChange(lang, "chorus", e.target.value)}
            placeholder="Enter chorus text..."
            className="min-h-[100px] resize-none border-accent/20 focus:border-accent/40"
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
                <Textarea
                  value={verse}
                  onChange={(e) => handleVerseChange(lang, index, e.target.value)}
                  placeholder="Enter verse text..."
                  className="min-h-[100px] resize-none"
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
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileImage className="w-4 h-4 text-primary" />
              <Label className="text-sm font-semibold text-primary/80">Partition / Sheet Music</Label>
            </div>
            <Tabs defaultValue="url" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-8">
                <TabsTrigger value="url" className="text-xs">URL</TabsTrigger>
                <TabsTrigger value="upload" className="text-xs">Upload</TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="mt-2">
                <Input
                  name="partitionUrl"
                  value={formData.partitionUrl || ""}
                  onChange={handleUrlChange}
                  placeholder="Image URL..."
                  className="h-8 text-xs"
                />
              </TabsContent>
              <TabsContent value="upload" className="mt-2">
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    disabled={isUploading || isUserLoading || !user}
                    onChange={(e) => handleFileUpload(e, 'partitionUrl')}
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
            {formData.partitionUrl && (
              <p className="text-[10px] text-muted-foreground truncate">
                Linked: {formData.partitionUrl}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-primary" />
              <Label className="text-sm font-semibold text-primary/80">Audio Recording</Label>
            </div>
            <Tabs defaultValue="url" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-8">
                <TabsTrigger value="url" className="text-xs">URL</TabsTrigger>
                <TabsTrigger value="upload" className="text-xs">Upload</TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="mt-2">
                <Input
                  name="audioUrl"
                  value={formData.audioUrl || ""}
                  onChange={handleUrlChange}
                  placeholder="Audio URL..."
                  className="h-8 text-xs"
                />
              </TabsContent>
              <TabsContent value="upload" className="mt-2">
                <div className="relative">
                  <Input
                    type="file"
                    accept="audio/*"
                    disabled={isUploading || isUserLoading || !user}
                    onChange={(e) => handleFileUpload(e, 'audioUrl')}
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
            {formData.audioUrl && (
              <p className="text-[10px] text-muted-foreground truncate">
                Linked: {formData.audioUrl}
              </p>
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