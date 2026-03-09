
"use client";

import * as React from "react";
import { Plus, Music2, Loader2, Download, FileJson, FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SongList } from "@/components/song-management/song-list";
import { SongForm } from "@/components/song-management/song-form";
import { SongView } from "@/components/song-management/song-view";
import { DeleteConfirm } from "@/components/song-management/delete-confirm";
import { Song, NewSong, getDisplayTitle } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  useCollection, 
  useFirestore, 
  useAuth, 
  useUser, 
  useMemoFirebase,
  setDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
  initiateAnonymousSignIn
} from "@/firebase";
import { collection, doc } from "firebase/firestore";

export default function HarmonyForge() {
  const db = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const [view, setView] = React.useState<"list" | "details">("list");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingSong, setEditingSong] = React.useState<Song | null>(null);
  const [selectedSong, setSelectedSong] = React.useState<Song | null>(null);
  const [songToDelete, setSongToDelete] = React.useState<Song | null>(null);
  
  const jsonInputRef = React.useRef<HTMLInputElement>(null);
  const csvInputRef = React.useRef<HTMLInputElement>(null);

  // Ensure user is signed in anonymously to satisfy security rules
  React.useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  // Real-time subscription to the 'songs' collection
  const songsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "songs");
  }, [db]);

  const { data: songs, isLoading: isSongsLoading } = useCollection<Song>(songsQuery);

  const handleCreateNew = () => {
    setEditingSong(null);
    setIsFormOpen(true);
  };

  const handleEdit = (song: Song) => {
    setEditingSong(song);
    setIsFormOpen(true);
  };

  const handleSelect = (song: Song) => {
    setSelectedSong(song);
    setView("details");
  };

  const handleDeleteClick = (song: Song) => {
    setSongToDelete(song);
  };

  const confirmDelete = () => {
    if (songToDelete && db) {
      const docRef = doc(db, "songs", songToDelete.id);
      deleteDocumentNonBlocking(docRef);
      
      if (selectedSong?.id === songToDelete.id) {
        setView("list");
        setSelectedSong(null);
      }
      
      toast({
        title: "Song deleted",
        description: `"${getDisplayTitle(songToDelete)}" has been removed.`,
      });
      setSongToDelete(null);
    }
  };

  const handleSave = (songData: Song | NewSong) => {
    if (!db) return;

    if ("id" in songData && songData.id) {
      // Update existing
      const docRef = doc(db, "songs", songData.id);
      updateDocumentNonBlocking(docRef, songData);
      
      if (selectedSong?.id === songData.id) {
        setSelectedSong(songData as Song);
      }
      toast({ title: "Song updated", description: "Changes have been saved successfully." });
    } else {
      // Create new - Security rules require document ID to match internal 'id'
      const customId = Math.random().toString(36).substring(2, 11);
      const newSongWithId: Song = { ...songData, id: customId } as Song;
      const docRef = doc(db, "songs", customId);
      
      setDocumentNonBlocking(docRef, newSongWithId, {});
      toast({ title: "Song created", description: "New song added to the collection." });
    }
    setIsFormOpen(false);
  };

  const exportToJSON = () => {
    if (!songs) return;
    const jsonString = JSON.stringify(songs, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `harmonyforge_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export Complete", description: "Collection exported as JSON file." });
  };

  const exportToCSV = () => {
    if (!songs) return;
    const headers = [
      "ID",
      "EN_Number", "EN_Title", "EN_Author", "EN_Year",
      "FR_Number", "FR_Title", "FR_Author", "FR_Year",
      "PartitionURL", "AudioURL"
    ];
    
    const rows = songs.map(s => [
      s.id,
      s.content?.en?.number || "",
      s.content?.en?.title || "",
      s.content?.en?.author || "",
      s.content?.en?.year || "",
      s.content?.fr?.number || "",
      s.content?.fr?.title || "",
      s.content?.fr?.author || "",
      s.content?.fr?.year || "",
      s.partitionUrl || "",
      s.audioUrl || ""
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(","));

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `harmonyforge_metadata_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export Complete", description: "Metadata exported as CSV file." });
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!db) {
      toast({ variant: "destructive", title: "Connection Error", description: "Database not ready. Please wait." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== 'string') throw new Error("File content is not text");
        
        const importedData = JSON.parse(result);
        if (!Array.isArray(importedData)) throw new Error("Imported data must be an array of songs.");

        let count = 0;
        importedData.forEach((song: any) => {
          if (!song.content) return;
          
          const id = song.id || Math.random().toString(36).substring(2, 11);
          const songToSave = { ...song, id };
          const docRef = doc(db, "songs", id);
          setDocumentNonBlocking(docRef, songToSave, {});
          count++;
        });

        if (count > 0) {
          toast({ title: "Import Successful", description: `${count} songs imported from JSON.` });
        } else {
          toast({ variant: "destructive", title: "Import Failed", description: "No valid songs found in file." });
        }
      } catch (err: any) {
        toast({ variant: "destructive", title: "Import Failed", description: err.message || "Invalid JSON format." });
      }
    };
    reader.onerror = () => toast({ variant: "destructive", title: "Error", description: "Could not read file." });
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!db) {
      toast({ variant: "destructive", title: "Connection Error", description: "Database not ready. Please wait." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
        if (lines.length < 2) {
          toast({ variant: "destructive", title: "Import Failed", description: "CSV file is empty or missing data." });
          return;
        }

        let count = 0;
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          // Robust CSV split that handles quotes and commas
          const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          
          if (parts && parts.length >= 11) {
            const clean = (s: string) => {
              if (!s) return "";
              let val = s.trim();
              if (val.startsWith('"') && val.endsWith('"')) {
                val = val.substring(1, val.length - 1);
              }
              return val.replace(/""/g, '"');
            };

            const [id, enNum, enTitle, enAuthor, enYear, frNum, frTitle, frAuthor, frYear, pUrl, aUrl] = parts.map(clean);
            
            const songId = id || Math.random().toString(36).substring(2, 11);
            const song: Song = {
              id: songId,
              content: {
                en: { 
                  number: enNum || "", 
                  title: enTitle || "", 
                  author: enAuthor || "", 
                  year: enYear || "", 
                  verses: [], 
                  chorus: "" 
                },
                fr: { 
                  number: frNum || "", 
                  title: frTitle || "", 
                  author: frAuthor || "", 
                  year: frYear || "", 
                  verses: [], 
                  chorus: "" 
                },
              },
              partitionUrl: pUrl || "",
              audioUrl: aUrl || ""
            };
            
            const docRef = doc(db, "songs", songId);
            setDocumentNonBlocking(docRef, song, {});
            count++;
          }
        }

        if (count > 0) {
          toast({ title: "Import Successful", description: `${count} songs imported from CSV metadata.` });
        } else {
          toast({ variant: "destructive", title: "Import Failed", description: "No valid rows found in CSV." });
        }
      } catch (err) {
        toast({ variant: "destructive", title: "Import Failed", description: "Error processing CSV file." });
      }
    };
    reader.onerror = () => toast({ variant: "destructive", title: "Error", description: "Could not read file." });
    reader.readAsText(file);
    e.target.value = "";
  };

  const isLoading = isUserLoading || isSongsLoading;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30">
      {/* Hidden Inputs for Import */}
      <input type="file" accept=".json" ref={jsonInputRef} onChange={handleImportJSON} className="hidden" />
      <input type="file" accept=".csv" ref={csvInputRef} onChange={handleImportCSV} className="hidden" />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-primary/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl">
              <Music2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-headline font-bold text-primary tracking-tight">
              HarmonyForge
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isLoading} className="hidden sm:flex">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => jsonInputRef.current?.click()}>
                  <FileJson className="w-4 h-4 mr-2" />
                  Import JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => csvInputRef.current?.click()}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Import CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isLoading || !songs?.length} className="hidden sm:flex">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={exportToJSON}>
                  <FileJson className="w-4 h-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToCSV}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={handleCreateNew} disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20">
              <Plus className="w-4 h-4 mr-2" />
              New Song
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground animate-pulse font-headline">Connecting to Hymnal...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* List Section */}
            <div className={`${view === 'details' ? 'hidden lg:block' : 'block'} lg:col-span-5`}>
              <div className="sticky top-24">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-headline font-semibold text-primary/80">Song Collection</h2>
                  <span className="text-sm font-medium text-muted-foreground px-2 py-1 bg-white/50 rounded-lg border border-primary/5">
                    {songs?.length || 0} items
                  </span>
                </div>
                <SongList
                  songs={songs || []}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onSelect={handleSelect}
                />
              </div>
            </div>

            {/* Action Area Section */}
            <div className="lg:col-span-7">
              {view === "list" && (
                <div className="hidden lg:flex h-[70vh] items-center justify-center bg-white/20 border-2 border-dashed border-primary/10 rounded-3xl animate-in fade-in zoom-in duration-700">
                  <div className="text-center space-y-4 max-w-xs">
                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Music2 className="w-10 h-10 text-primary/30" />
                    </div>
                    <h3 className="text-xl font-headline text-primary/60">Select a song</h3>
                    <p className="text-muted-foreground text-sm">
                      Choose a song from the collection to view its details, or start by creating a new one.
                    </p>
                  </div>
                </div>
              )}

              {view === "details" && selectedSong && (
                <SongView
                  song={selectedSong}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onBack={() => {
                    setView("list");
                    setSelectedSong(null);
                  }}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Form Sidebar (Sheet) */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl p-0 overflow-hidden flex flex-col">
          <SheetHeader className="p-6 border-b bg-muted/20">
            <SheetTitle className="font-headline text-2xl text-primary">
              {editingSong ? "Edit Song" : "Create New Song"}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              {editingSong ? "Update the details and translations of your song." : "Add a new song to your collection in multiple languages."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <SongForm
              song={editingSong}
              onSave={handleSave}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog */}
      <DeleteConfirm
        open={!!songToDelete}
        onOpenChange={(open) => !open && setSongToDelete(null)}
        onConfirm={confirmDelete}
        songTitle={songToDelete ? getDisplayTitle(songToDelete) : ""}
      />
    </div>
  );
}
